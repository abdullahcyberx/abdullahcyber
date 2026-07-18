import re

with open('ai_logic.js', 'r', encoding='utf-8') as f:
    ai_logic = f.read()

# Fix 1: Re-order detectIntent
detect_intent_orig = '''  const detectIntent = (expanded, q) => {
    const qStr = normalizeQuery(q);
    if (expanded.includes("who") || expanded.includes("identity") || qStr.includes("tell me about abdullah") || qStr.includes("who is")) return "identity";
    if (expanded.includes("specialization") || expanded.includes("specialize")) return "specialization";
    if (expanded.includes("education") || expanded.includes("graduation")) return "education";
    if (expanded.includes("contact") || expanded.includes("linkedin") || expanded.includes("github") || expanded.includes("cv")) return "contact";
    if (expanded.includes("recruitment") || expanded.includes("suitable") || expanded.includes("hire")) return "recruiter";
    if (expanded.includes("soc") || qStr.includes("soc role") || qStr.includes("soc internship")) return "soc_suitability";
    if (expanded.includes("pentest") || expanded.includes("penetration")) return "pentest_suitability";
    if (expanded.includes("web") && expanded.includes("security")) return "web_suitability";
    if (expanded.includes("skill") || expanded.includes("tools") || expanded.includes("languages") || expanded.includes("python")) return "skills";
    
    if (qStr.includes("tell me more") || qStr.includes("what tools")) return "followup_more";'''

detect_intent_new = '''  const detectIntent = (expanded, q) => {
    const qStr = normalizeQuery(q);
    if (expanded.includes("who") || expanded.includes("identity") || qStr.includes("tell me about abdullah") || qStr.includes("who is")) return "identity";
    if (expanded.includes("specialization") || expanded.includes("specialize")) return "specialization";
    if (expanded.includes("education") || expanded.includes("graduation")) return "education";
    if (expanded.includes("contact") || expanded.includes("linkedin") || expanded.includes("github") || expanded.includes("cv")) return "contact";
    if (expanded.includes("recruitment") || expanded.includes("suitable") || expanded.includes("hire")) return "recruiter";
    if (expanded.includes("soc") || qStr.includes("soc role") || qStr.includes("soc internship")) return "soc_suitability";
    if (expanded.includes("pentest") || expanded.includes("penetration")) return "pentest_suitability";
    if (expanded.includes("web") && expanded.includes("security")) return "web_suitability";
    
    if (qStr.includes("tell me more") || qStr.includes("what tools")) return "followup_more";
    if (expanded.includes("skill") || expanded.includes("tools") || expanded.includes("languages") || expanded.includes("python")) return "skills";'''

ai_logic = ai_logic.replace(detect_intent_orig, detect_intent_new)

# Fix 2: Identity response
identity_orig = '''    if (intent === "identity") {
      text = getVariation([
        "Muhammad Abdullah is a Cyber Security student focusing on web application security, penetration testing, and practical security projects.",
        "He is an early-career cybersecurity candidate with hands-on experience through internships and technical projects.",
        "Muhammad specializes in offensive security and practical cyber defense, evidenced by his portfolio projects and certifications."
      ]);
    } else if'''

identity_new = '''    if (intent === "identity") {
      text = getVariation([
        "Muhammad Abdullah is a Cyber Security student focusing on web application security, penetration testing, and practical security projects.",
        "Muhammad Abdullah is an early-career cybersecurity candidate with hands-on experience through internships and technical projects.",
        "Muhammad Abdullah specializes in offensive security and practical cyber defense, evidenced by his portfolio projects and certifications."
      ]);
    } else if'''

ai_logic = ai_logic.replace(identity_orig, identity_new)

with open('ai_logic.js', 'w', encoding='utf-8') as f:
    f.write(ai_logic)

print("Fixed ai_logic.js")

