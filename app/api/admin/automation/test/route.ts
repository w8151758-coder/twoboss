import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// 模拟发送WhatsApp消息
async function sendWhatsAppMessage(phoneNumber: string, message: string, settings: Record<string, string>) {
  const apiToken = settings.whatsapp_api_token
  const phoneId = settings.whatsapp_phone_id
  
  if (!apiToken || !phoneId) {
    throw new Error("WhatsApp API未配置，请在系统设置中配置WhatsApp Business API")
  }
  
  // 实际生产中使用WhatsApp Cloud API
  // const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${apiToken}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to: phoneNumber,
  //     type: 'text',
  //     text: { body: message }
  //   })
  // })
  
  // 测试模式：模拟成功
  return { success: true, message_id: `test_${Date.now()}` }
}

// 模拟发送邮件
async function sendEmail(to: string, subject: string, body: string, settings: Record<string, string>) {
  const smtpHost = settings.email_smtp_host
  const smtpUser = settings.email_smtp_user
  
  if (!smtpHost || !smtpUser) {
    throw new Error("邮件服务未配置，请在系统设置中配置SMTP")
  }
  
  // 实际生产中使用nodemailer或其他邮件服务
  // 测试模式：模拟成功
  return { success: true, message_id: `email_${Date.now()}` }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const { ruleId } = await request.json()

    // 获取规则
    const { data: rule, error: ruleError } = await supabase
      .from("automation_rules")
      .select("*")
      .eq("id", ruleId)
      .single()

    if (ruleError || !rule) {
      return NextResponse.json({ error: "规则不存在" }, { status: 404 })
    }

    // 获取设置
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("key, value")

    const settings: Record<string, string> = {}
    settingsData?.forEach((s: { key: string; value: string }) => {
      settings[s.key] = s.value || ""
    })

    let result: { success: boolean; message: string; details?: unknown }

    try {
      switch (rule.action_type) {
        case "send_whatsapp":
          // 测试发送WhatsApp
          const whatsappResult = await sendWhatsAppMessage(
            settings.whatsapp_number || "8618888888888",
            "这是一条测试消息",
            settings
          )
          result = { 
            success: true, 
            message: "WhatsApp测试消息发送成功（测试模式）",
            details: whatsappResult
          }
          break

        case "send_email":
          // 测试发送邮件
          const emailResult = await sendEmail(
            settings.email_from_address || "test@example.com",
            "测试邮件",
            "这是一封测试邮件",
            settings
          )
          result = { 
            success: true, 
            message: "测试邮件发送成功（测试模式）",
            details: emailResult
          }
          break

        case "system_notification":
          result = { 
            success: true, 
            message: "系统通知测试成功"
          }
          break

        default:
          result = { 
            success: true, 
            message: `自动化规则 "${rule.name}" 测试成功`
          }
      }

      // 记录测试日志
      await supabase.from("automation_logs").insert({
        rule_id: ruleId,
        status: "success",
        trigger_data: { test: true },
        result_data: result,
      })

      // 更新运行次数
      await supabase
        .from("automation_rules")
        .update({ 
          run_count: (rule.run_count || 0) + 1,
          last_run_at: new Date().toISOString()
        })
        .eq("id", ruleId)

      return NextResponse.json(result)

    } catch (actionError) {
      const errorMessage = actionError instanceof Error ? actionError.message : "执行失败"
      
      // 记录失败日志
      await supabase.from("automation_logs").insert({
        rule_id: ruleId,
        status: "failed",
        trigger_data: { test: true },
        error_message: errorMessage,
      })

      return NextResponse.json({ 
        success: false, 
        message: errorMessage 
      }, { status: 400 })
    }

  } catch (error) {
    console.error("Error testing automation:", error)
    return NextResponse.json({ error: "测试失败" }, { status: 500 })
  }
}
