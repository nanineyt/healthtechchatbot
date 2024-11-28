const { COMPLETION_TEMPLATE } = require("../config/ai_tool");
const OpenAI = require("openai");
const {
  viewAllSchedule,
  addToCart,
  viewCart,
  clearCart,
} = require("./database.services");
const { pushMessageToGroup } = require("./line_messaging_api.service");

const submitMessageToGPT = async ({ userID, messages }) => {
  const allSchedule = await viewAllSchedule();
  const payload_template = { ...COMPLETION_TEMPLATE };
  payload_template.messages[0].content += `\nตารางการทำงานของแพทยดังนี้ ${allSchedule}`;
  payload_template.messages = payload_template.messages.concat(messages);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const gptResponseMessage = await openai.chat.completions.create(
    payload_template
  );
  payload_template.messages.push(gptResponseMessage.choices[0].message);

  let messageToReplyCallback = "";
  if (gptResponseMessage?.choices?.[0]?.finish_reason === "tool_calls") {
    for (const toolCall of gptResponseMessage.choices[0].message.tool_calls) {
      let toolArg = JSON.parse(toolCall.function.arguments);
      toolArg = Object.keys(toolArg).length === 0 ? null : toolArg;

      const toolName = toolCall.function.name;
      const toolCallID = toolCall.id;

      let toolResponseText = "ฟีเจอร์นี้ยังไม่ได้พัฒนา";
      if (toolName === "view_all_schedule") {
        toolResponseText = await viewAllSchedule(toolArg);
      } else if (toolName === "add_booking") {
        await addToCart(
          userID,
          toolArg?.name_doc,
          toolArg?.date,
          toolArg?.startTime,
          toolArg?.endTime
        );
        toolResponseText = "เพิ่มสำเร็จ";
        await pushMessageToGroup({
          messageText: `มีผู้ป่วยจองเพิ่ม\nแพทย์ : ${toolArg?.name_doc}\nวันที่ : ${toolArg?.date}\nเวลา : ${toolArg?.startTime} - ${toolArg?.endTime}\nโดยผู้ใช้รหัส ${userID}`,
        });
      } else if (toolName === "view_cart") {
        const cartItems = await viewCart(userID);
        toolResponseText = `มีรายการต่อไปนี้ในตะกร้า ${cartItems}`;
      } else if (toolName === "clear_cart") {
        await clearCart(userID);
        toolResponseText = `ล้างรายการในตะกร้าแล้ว`;
      } else if (toolName === "confirm_order") {
        const cartItems = await viewCart(userID);
        // await pushMessageToGroup({
        //   messageText: `มีผู้ป่วยจองเข้า ${cartItems} โดยผู้ใช้รหัส ${userID}`,
        // });
        toolResponseText = `รายการการตรวจของลูกค้า :  ${cartItems} `;
      }
      payload_template.messages.push({
        role: "tool",
        content: [{ type: "text", text: toolResponseText }],
        tool_call_id: toolCallID,
      });
    }
    const responseAfterToolCall = await openai.chat.completions.create(
      payload_template
    );
    payload_template.messages.push(responseAfterToolCall.choices[0].message);
    messageToReplyCallback = responseAfterToolCall.choices[0].message.content;
  } else {
    messageToReplyCallback = gptResponseMessage.choices[0].message.content;
  }
  payload_template.messages.splice(0, 1);
  return {
    status: "success",
    message_to_reply: messageToReplyCallback,
    messages: payload_template.messages,
  };
};

module.exports = { submitMessageToGPT };
