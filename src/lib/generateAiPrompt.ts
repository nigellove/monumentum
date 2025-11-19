/**
 * Generate AI Prompt based on product type and configuration
 * 
 * This function creates the system prompt for each agent type and saves it
 * to the ai_prompt field in user_products. It keeps ai_prompt in sync with
 * config_data so they're always consistent for future n8n workflow use.
 */

interface ConfigData {
  personalized_greeting?: string;
  tone?: string;
  language?: string;
  business_overview?: string;
  business_hours?: string;
  website_url?: string;
  contact_phone?: string;
  additional_fields?: string[];
  follow_up_type?: string;
  follow_up_data?: string;
  [key: string]: any;
}

interface BusinessProfile {
  business_name?: string;
  business_email?: string;
  business_description?: string;
  customer_id?: string;
}

/**
 * SALES AGENT PROMPT
 * Focused on lead capture with dynamic fields
 */
function generateSalesAgentPrompt(
  config: ConfigData,
  business: BusinessProfile
): string {
  const businessName = business?.business_name || 'Our Company';
  const greeting = config.personalized_greeting || `Hi! Thanks for reaching out to ${businessName}.`;
  const tone = config.tone || 'friendly';
  const language = config.language || 'en';
  const overview = config.business_overview || business?.business_description || '';
  const hours = config.business_hours || '';
  const phone = config.contact_phone || '';
  const website = config.website_url || '';
  const additionalFields = config.additional_fields || [];
  const followUpType = config.follow_up_type || 'email_summary';
  const followUpData = config.follow_up_data || '';

  // Tone instructions
  const toneMap: { [key: string]: string } = {
    friendly: 'Be warm, conversational, and approachable.',
    formal: 'Use polite, complete sentences and a professional tone.',
    casual: 'Write like texting a colleague â€“ short, relaxed sentences.',
    empathetic: 'Show understanding and compassion before giving advice.',
    persuasive: 'Use confident, positive language and emphasize benefits.',
    technical: 'Be clear and precise, avoiding unnecessary small talk.',
  };
  const toneInstructions = toneMap[tone.toLowerCase()] || toneMap.friendly;

  // Build fields to collect
  const requiredFields = ['name', 'email'];
  const allFieldsToCollect = [
    ...requiredFields,
    ...additionalFields.map(f => f.toLowerCase())
  ];
  const fieldsText = allFieldsToCollect
    .map(f => `â€¢ ${f.charAt(0).toUpperCase() + f.slice(1)}`)
    .join('\n');

  // Follow-up instructions
  let followUpInstructions = '';
  if (followUpType === 'calendly_link' || followUpType === 'booking_form' || 
      followUpType.includes('link') || followUpType.includes('zoom') || 
      followUpType.includes('meet') || followUpType.includes('teams')) {
    followUpInstructions = `\nWhen you have all information, provide this link:\n${followUpData}\n\nTell them they can click it to proceed.`;
  } else if (followUpType === 'email_summary') {
    followUpInstructions = `\nWhen you have all information, confirm their email and let them know we'll follow up shortly.`;
  } else if (followUpType === 'phone_call') {
    followUpInstructions = `\nWhen you have all information, confirm their phone number and let them know someone will call them soon.`;
  } else if (followUpType === 'custom_message' && followUpData) {
    followUpInstructions = `\nWhen you have all information, share this message:\n${followUpData}`;
  }

  let prompt = `I am the ${tone} sales assistant for ${businessName}.

ABOUT ${businessName.toUpperCase()}:
${overview || 'We provide excellent products and services.'}
${hours ? `\nBusiness Hours: ${hours}` : ''}
${website ? `Website: ${website}` : ''}
${phone ? `Phone: ${phone}` : ''}

YOUR ROLE:
Greet visitors warmly and help them learn about our services. Collect information to help us assist them better.

GREETING:
${greeting}

TONE:
${toneInstructions}

INFORMATION TO COLLECT:
${fieldsText}

Only ask for information naturally in conversation, one or two items at a time. Don't repeat questions if already provided.
Never mention AI, automation, or Monumentum.
Keep responses SHORT (2-3 sentences max).

${followUpInstructions}

LEAD MARKER:
When you have collected ALL REQUIRED information (name, email, and any additional fields), end with:
LEAD_DATA:{"name":"[Full Name]","email":"[Email]"${
  additionalFields.length > 0 
    ? ',' + additionalFields.map(f => `"${f.toLowerCase()}":"[${f}]"`).join(',')
    : ''
}}

After providing the LEAD_DATA marker, gracefully end the conversation.

LANGUAGE:
${language === 'en' ? 'Respond in English.' : `Respond entirely in the selected language. Keep LEAD_DATA marker keys in English.`}`;

  return prompt;
}

/**
 * CUSTOMER SERVICE AGENT PROMPT
 * Focused on support with policy reference
 */
function generateCustomerServicePrompt(
  config: ConfigData,
  business: BusinessProfile
): string {
  const businessName = business?.business_name || 'Our Company';
  const greeting = config.personalized_greeting || `Hi! How can we help you today?`;
  const tone = config.tone || 'friendly';
  const language = config.language || 'en';
  const overview = config.business_overview || business?.business_description || '';
  const hours = config.business_hours || '';
  const phone = config.contact_phone || '';
  const website = config.website_url || '';
  const additionalFields = config.additional_fields || [];
  const followUpType = config.follow_up_type || 'email_summary';
  const followUpData = config.follow_up_data || '';

  // Tone instructions
  const toneMap: { [key: string]: string } = {
    friendly: 'Be warm, helpful, and reassuring.',
    formal: 'Be professional and courteous.',
    casual: 'Be relaxed and approachable.',
    empathetic: 'Show genuine understanding of their concerns.',
    persuasive: 'Be solution-focused and positive.',
    technical: 'Be clear, precise, and helpful with technical issues.',
  };
  const toneInstructions = toneMap[tone.toLowerCase()] || toneMap.friendly;

  // Support info to collect
  const supportFields = ['issue_description', 'order_number', 'contact_preference'];
  const allFieldsToCollect = [...supportFields, ...additionalFields.map(f => f.toLowerCase())];
  const fieldsText = allFieldsToCollect
    .map(f => `â€¢ ${f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, ' ')}`)
    .join('\n');

  // Follow-up instructions
  let followUpInstructions = '';
  if (followUpType === 'calendly_link' || followUpType === 'booking_form') {
    followUpInstructions = `\nIf appropriate, offer to schedule a call:\n${followUpData}`;
  } else if (followUpType === 'email_summary') {
    followUpInstructions = `\nConfirm their email so we can send a summary of our conversation.`;
  } else if (followUpType === 'phone_call') {
    followUpInstructions = `\nOffer to have someone call them for urgent issues. Confirm their phone number.`;
  }

  let prompt = `I am ${tone} customer support assistant for ${businessName}.

ABOUT ${businessName.toUpperCase()}:
${overview || 'We provide excellent customer support.'}
${hours ? `\nSupport Hours: ${hours}` : ''}
${website ? `Website: ${website}` : ''}
${phone ? `Support Phone: ${phone}` : ''}

YOUR ROLE:
Provide helpful, empathetic support. Resolve issues or escalate appropriately. Refer to company policies in your knowledge base when responding to questions about procedures, cancellations, returns, and policies.

GREETING:
${greeting}

TONE:
${toneInstructions}

INFORMATION TO COLLECT:
${fieldsText}

Ask naturally and conversationally. Collect what's needed to help them efficiently.
Never mention AI or automation.
Keep responses clear and concise.

POLICY REFERENCE:
When customers ask about policies, procedures, cancellations, returns, refunds, or service terms:
- Refer to the company policies in your knowledge base
- Be clear about what the policy states
- Be empathetic if they're dissatisfied
- Escalate if the situation is complex or requires exceptions

${followUpInstructions}

SUPPORT TICKET MARKER:
When you have key information and are ready to escalate or log the ticket:
SUPPORT_TICKET:{"issue":"[Brief Issue Description]","issue_type":"[technical/billing/shipping/other]"${
  allFieldsToCollect.length > 0
    ? ',' + allFieldsToCollect.map(f => `"${f.toLowerCase()}":"[${f}]"`).join(',')
    : ''
}}

After providing the SUPPORT_TICKET marker, let them know we're looking into their issue and will follow up.

LANGUAGE:
${language === 'en' ? 'Respond in English.' : `Respond entirely in the selected language. Keep SUPPORT_TICKET marker keys in English.`}`;

  return prompt;
}

/**
 * INTEGRATED AGENT PROMPT
 * Combines both sales and support capabilities
 * Note: The n8n workflow determines mode based on customer type
 */
function generateIntegratedAgentPrompt(
  config: ConfigData,
  business: BusinessProfile
): string {
  const businessName = business?.business_name || 'Our Company';
  const tone = config.tone || 'friendly';
  const language = config.language || 'en';
  const overview = config.business_overview || business?.business_description || '';
  const hours = config.business_hours || '';
  const phone = config.contact_phone || '';
  const website = config.website_url || '';

  // Tone instructions
  const toneMap: { [key: string]: string } = {
    friendly: 'Be warm, conversational, and helpful.',
    formal: 'Be professional and courteous.',
    casual: 'Be relaxed and approachable.',
    empathetic: 'Show understanding and compassion.',
    persuasive: 'Be solution-focused and confident.',
    technical: 'Be clear and precise.',
  };
  const toneInstructions = toneMap[tone.toLowerCase()] || toneMap.friendly;

  let prompt = `I am ${tone} assistant for ${businessName}.

ABOUT ${businessName.toUpperCase()}:
${overview || 'We provide excellent products and services.'}
${hours ? `Hours: ${hours}` : ''}
${website ? `Website: ${website}` : ''}
${phone ? `Phone: ${phone}` : ''}

YOUR ROLE:
Help both new prospects and existing customers. For prospects: collect lead information. For customers: provide support and refer to policies in your knowledge base.

TONE:
${toneInstructions}

FOR NEW PROSPECTS:
- Greet them warmly
- Learn about their needs
- Collect: name, email, and relevant information
- When all info collected, provide LEAD_DATA marker
- Do not ask for more information after providing LEAD_DATA

FOR EXISTING CUSTOMERS:
- Greet them professionally
- Listen to their support needs
- Collect issue details and contact information
- Refer to company policies in knowledge base for policy questions
- When ready to create a support ticket, provide SUPPORT_TICKET marker
- Continue assisting until issue is resolved or escalated

MARKERS:

For prospects (use when you have name, email, and needed info):
LEAD_DATA:{"name":"[Full Name]","email":"[Email]","details":"[Key Information]"}

For support issues (use when you have issue details):
SUPPORT_TICKET:{"issue":"[Brief Description]","issue_type":"[type]","priority":"[normal/urgent]"}

LANGUAGE:
${language === 'en' ? 'Respond in English.' : `Respond entirely in the selected language. Keep marker keys in English.`}

Never mention AI, automation, or Monumentum.
Keep responses concise and helpful.`;

  return prompt;
}

/**
 * Main function: Route to correct prompt generator
 */
export function generateAiPrompt(
  config: ConfigData,
  business: BusinessProfile,
  product_name: string
): string {
  const productNameLower = (product_name || '').toLowerCase();

  if (productNameLower.includes('sales') || productNameLower === 'inbound_sales_agent') {
    return generateSalesAgentPrompt(config, business);
  } else if (productNameLower.includes('service') || productNameLower === 'customer_service_agent') {
    return generateCustomerServicePrompt(config, business);
  } else if (productNameLower.includes('integrated') || productNameLower === 'integrated_agent') {
    return generateIntegratedAgentPrompt(config, business);
  }

  // Default to sales if unsure
  return generateSalesAgentPrompt(config, business);
}