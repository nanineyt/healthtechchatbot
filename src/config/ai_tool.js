const COMPLETION_TEMPLATE = {
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: [
        {
          // text: "เป็นพนักงานรับรายการอาหารอยู่หน้าร้าน\nคุณจะคุยกับลูกค้าเพื่อจดรายการอาหารและส่งต่อให้พนักงานในครัวเพื่อทำอาหารตามออเดอร์",
          text: "เป็นผู้ช่วยจองเวลาพบแพทย์หรือให้ข้อมูลเบื้องต้นเกี่ยวกับโรค คุณจะคุยกับลูกค้าเพื่อนัดเวลาพบแพทย์ ตอบคำถามเบื้องต้นเกี่ยวกับอาการต่างๆ และสนับสนุนการดูแลจิตใจ ",
          type: "text",
        },
      ],
    },
  ],
  temperature: 0.3,
  max_tokens: 2048,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  tools: [
    {
      type: "function",
      function: {
        name: "view_all_schedule",
        strict: true,
        parameters: {
          type: "object",
          required: [],
          properties: {},
          additionalProperties: false,
        },
        description: "เรียกดูตารางการออกตรวจของแพทย์",
      },
    },
    {
      type: "function",
      function: {
        name: "view_cart",
        strict: true,
        parameters: {
          type: "object",
          required: [],
          properties: {},
          additionalProperties: false,
        },
        description: "เรียกดูตารางการตรวจของฉัน",
      },
    },
    {
      type: "function",
      function: {
        name: "clear_cart",
        strict: true,
        parameters: {
          type: "object",
          required: [],
          properties: {},
          additionalProperties: false,
        },
        description: "ลบตารางการออกตรวจ",
      },
    },
    {
      type: "function",
      function: {
        name: "add_booking",
        strict: true,
        parameters: {
          type: "object",
          required: ["name_doc", "date", "startTime", "endTime"],
          properties: {
            name_doc: {
              type: "string",
              description: "ชื่อแพทย์",
            },
            date: {
              type: "string",
              description:
                "วันที่ที่ต้องการเข้าตรวจ (ISO 8601 format, e.g., 2024-11-28T15:00:00Z)",
            },
            startTime: {
              type: "string",
              description: "เวลาเริ่มต้น",
            },
            endTime: {
              type: "string",
              description: "เวลาเริ่มสิ้นสุด",
            },
          },
          additionalProperties: false,
        },
        description:
          "เพิ่มการจองเข้าตารางเพื่อรอ Submit โดยรับเป็น name_doc, date,startTime,endTime ของรายการการจอง",
      },
    },
    {
      type: "function",
      function: {
        name: "confirm_order",
        strict: true,
        parameters: {
          type: "object",
          required: ["action", "order_id"],
          properties: {
            action: {
              enum: ["confirm", "cancel", "add_more"],
              type: "string",
              description:
                "การกระทำที่ต้องการเลือก: ยืนยัน, ยกเลิก หรือ ต้องการสั่งเพิ่ม",
            },
            order_id: {
              type: "string",
              description: "รหัสของออเดอร์ที่ต้องการยืนยันหรือยกเลิก",
            },
          },
          additionalProperties: false,
        },
        description:
          "ยืนยันออเดอร์โดยรับค่า ยืนยัน หรือ ยกเลิก หรือต้องการสั่งเพิ่ม",
      },
    },
  ],
  parallel_tool_calls: true,
  response_format: {
    type: "text",
  },
};

module.exports = { COMPLETION_TEMPLATE };
