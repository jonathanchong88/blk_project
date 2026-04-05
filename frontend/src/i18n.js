import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 1. Define English translations (Fallback)
const resources = {
  en: {
    translation: {
      "topbar.profile": "Profile",
      "topbar.logout": "Logout",
      "topbar.login": "Login",
      
      "sidebar.home": "Home",
      "sidebar.events": "Events",
      "sidebar.salvation": "Salvation",
      "sidebar.activities": "Activities",
      "sidebar.users": "Users",
      "sidebar.commitments": "Commitments",
      
      "sidebar.worship_section": "Worship",
      "sidebar.worship.songs": "Song",
      "sidebar.worship.band": "Band",
      "sidebar.worship.schedule": "Schedule",
      
      "footer.contact_info": "Contact Info",
      "footer.address": "Address:",
      "footer.address_text": "No 301, KB 1/5, Kampung Baru Selangor, Seri Kembangan, 43300, Selangor, Malaysia",
      "footer.phone": "Phone:",
      "footer.email": "Email:",
      "footer.opening_hours": "Opening hours:",
      "footer.socials": "Socials",
      "footer.copyright": "Copyright © 2026 - Lutheran Church in Balakong",
      "footer.privacy_policy": "Privacy Policy",
      
      "salvation.hero.eyebrow": "A New Beginning",
      "salvation.hero.title": "Salvation",
      "salvation.hero.subtitle": "Every story has a turning point. This could be yours.",
      "salvation.hero.cta": "I Made a Decision",
      "salvation.hero.scroll": "Scroll",

      "salvation.teaching.eyebrow": "The Path",
      "salvation.teaching.title": "What Now?",
      "salvation.teaching.subtitle": "If you've decided to follow Jesus, we want to walk this new journey alongside you.",
      
      "salvation.teaching.step1.title": "Acknowledge",
      "salvation.teaching.step1.body": "Recognize that we all fall short. Sin separates us from God — not as punishment, but as a natural distance from His perfection.",
      "salvation.teaching.step1.verse": "\"For all have fallen short of the glory of God.\"",
      
      "salvation.teaching.step2.title": "Believe",
      "salvation.teaching.step2.body": "Trust that Jesus Christ — the Son of God — died for your sins and rose from the dead, conquering death for you.",
      "salvation.teaching.step2.verse": "\"God so loved the world that He gave His one and only Son...\"",
      
      "salvation.teaching.step3.title": "Confess",
      "salvation.teaching.step3.body": "Speak it out with faith. When you confess with your mouth and believe in your heart, salvation is yours.",
      "salvation.teaching.step3.verse": "\"If you declare with your mouth... you will be saved.\"",
      
      "salvation.teaching.prayer.eyebrow": "A Prayer of Salvation",
      "salvation.teaching.prayer.body_pt1": "\"Dear God, I know I'm a sinner, and I ask for your forgiveness. I believe Jesus Christ is Your Son. I believe He died for my sin and rose from the dead. I want to trust and follow Him as Lord and Saviour from this day forward. In Jesus' name, ",
      "salvation.teaching.prayer.amen": "Amen.",
      "salvation.teaching.prayer.body_pt2": "\"",

      "salvation.faq.eyebrow": "Got Questions?",
      "salvation.faq.title": "Common Questions",
      "salvation.faq.q1": "What does it mean to be saved?",
      "salvation.faq.a1": "To be saved means to be rescued from the penalty of sin and brought into a living relationship with God through Jesus Christ — not by what you do, but by what He has already done.",
      "salvation.faq.q2": "Do I have to be perfect first?",
      "salvation.faq.a2": "No. Salvation is a gift of grace, not a reward for perfection. God meets you exactly where you are. We are saved by faith, not by our own works or effort.",
      "salvation.faq.q3": "What if I mess up after accepting Jesus?",
      "salvation.faq.a3": "God's grace is greater than any failure. When we stumble, we can confess our sins honestly, and He is faithful and just to forgive us and restore us completely.",
      "salvation.faq.q4": "How do I grow in my new faith?",
      "salvation.faq.a4": "Read the Bible daily, pray honestly, connect with a community of believers, and look for ways to serve others. These habits build the relationship that changes everything.",
      "salvation.faq.q5": "What happens next after I submit my decision?",
      "salvation.faq.a5": "Someone from our team will reach out to you personally to walk alongside you in this new journey. You are not alone — this is just the beginning.",

      "salvation.form.eyebrow": "Take the Step",
      "salvation.form.title": "I Made a Decision",
      "salvation.form.subtitle": "Let us know — we would love to celebrate with you and support your next step.",
      
      "salvation.form.decision1.label": "🙏  I followed Jesus today",
      "salvation.form.decision1.desc": "I made a first-time commitment to Christ",
      "salvation.form.decision2.label": "📖  I want to learn more",
      "salvation.form.decision2.desc": "I'm curious and would love guidance",
      "salvation.form.decision3.label": "✨  I need prayer",
      "salvation.form.decision3.desc": "Please pray with me and for me",
      
      "salvation.form.first_name": "First Name",
      "salvation.form.last_name": "Last Name",
      "salvation.form.email": "Email Address",
      "salvation.form.phone": "Phone Number",
      "salvation.form.optional": "(Optional)",
      "salvation.form.submit": "Submit My Decision",
      "salvation.form.submitting": "Submitting...",
      "salvation.form.error": "Something went wrong. Please try again.",
      "salvation.form.alert": "Please select a decision.",
      
      "salvation.form.success.title": "Thank You",
      "salvation.form.success.desc": "We have received your decision. Someone from our team will personally reach out to walk this new journey with you.",

      "users.title": "User List",
      "users.loading": "Loading users...",
      "users.no_permission": "You do not have permission to view this page.",
      "users.confirm.activate": "Are you sure you want to activate this user?",
      "users.confirm.deactivate": "Are you sure you want to deactivate this user?",
      "users.alert.status_fail": "Failed to update status",
      "users.alert.no_email": "No email found for this user.",
      "users.confirm.reset": "Send password reset link to {{email}}?",
      "users.alert.reset_success": "Reset link sent!",
      "users.alert.reset_fail": "Failed to send reset link",
      "users.button.filters": "Filters",
      "users.search.placeholder": "Search by username, name or phone...",
      "users.filters.title": "Filters",
      "users.filters.age_range": "Age Range",
      "users.filters.min": "Min",
      "users.filters.max": "Max",
      "users.filters.clear": "Clear",
      "users.filters.done": "Done",
      "users.status.active": "Active",
      "users.status.inactive": "Inactive",
      "users.button.edit": "Edit User",
      "users.button.reset": "Send Password Reset Link",
      "users.label.id": "ID:",
      "users.label.age": "Age:",
      "users.label.phone": "Phone:",
      "users.label.address": "Address:",

      "worship.band.title": "Worship Team",
      "worship.band.roles": "Roles",
      "worship.band.all_members": "All Members",
      "worship.band.add_member": "+ Add Member",
      "worship.band.filter_by_role": "Filter by Role:",
      "worship.band.all_roles": "All Roles",
      "worship.band.no_members_found": "No team members found matching this filter.",
      "worship.band.edit_member_title": "Edit Team Member",
      "worship.band.add_member_title": "Add New Team Member",
      "worship.band.select_member": "Select Member:",
      "worship.band.select_user_placeholder": "-- Select User --",
      "worship.band.search_member_placeholder": "Search member...",
      "worship.band.no_users_found": "No users found",
      "worship.band.no_members_available": "No members available to select.",
      "worship.band.label.email": "Email:",
      "worship.band.label.phone": "Phone:",
      "worship.band.label.sex": "Sex",
      "worship.band.select_placeholder": "Select...",
      "worship.band.male": "Male",
      "worship.band.female": "Female",
      "worship.band.label.age": "Age",
      "worship.band.label.roles_skills": "Roles / Skills:",
      "worship.band.button.cancel": "Cancel",
      "worship.band.button.saving": "Saving...",
      "worship.band.button.update_member": "Update Member",
      "worship.band.button.add_member": "Add Member",
      "worship.band.loading_team": "Loading team...",
      "worship.band.alert.select_member": "Please select a member from the list.",
      "worship.band.alert.failed_update": "Failed to update member",
      "worship.band.alert.failed_add": "Failed to add member",
      "worship.band.chat_whatsapp": "Chat on WhatsApp"
    }
  },
  zh: {
    translation: {
      "topbar.profile": "个人资料",
      "topbar.logout": "登出",
      "topbar.login": "登录",
      
      "sidebar.home": "首页",
      "sidebar.events": "活动",
      "sidebar.salvation": "决志",
      "sidebar.activities": "活动记录",
      "sidebar.users": "用户管理",
      "sidebar.commitments": "决志名单",
      
      "sidebar.worship_section": "敬拜事工",
      "sidebar.worship.songs": "诗歌",
      "sidebar.worship.band": "乐队",
      "sidebar.worship.schedule": "排班",
      
      "footer.contact_info": "联络方式",
      "footer.address": "地址:",
      "footer.address_text": "No 301, KB 1/5, Kampung Baru Selangor, Seri Kembangan, 43300, Selangor, Malaysia",
      "footer.phone": "电话:",
      "footer.email": "邮箱:",
      "footer.opening_hours": "开放时间:",
      "footer.socials": "社交媒体",
      "footer.copyright": "版权所有 © 2026 - 无拉港路德圣公会",
      "footer.privacy_policy": "隐私政策",
      
      "salvation.hero.eyebrow": "新的开始",
      "salvation.hero.title": "救恩",
      "salvation.hero.subtitle": "每个人的生命都有转折点，这可能就是您的转折点。",
      "salvation.hero.cta": "我已作决定",
      "salvation.hero.scroll": "向下滚动",

      "salvation.teaching.eyebrow": "接下来呢？",
      "salvation.teaching.title": "如何迈出下一步？",
      "salvation.teaching.subtitle": "如果您决定跟随耶稣，我们希望能陪伴您走过这段新的旅程。",
      
      "salvation.teaching.step1.title": "承认",
      "salvation.teaching.step1.body": "承认我们都不完美。罪使我们与神隔绝——这不是惩罚，而是与祂的完美脱节。",
      "salvation.teaching.step1.verse": "“因为世人都犯了罪，亏缺了神的荣耀。”",
      
      "salvation.teaching.step2.title": "相信",
      "salvation.teaching.step2.body": "相信耶稣基督（神的儿子）为您的罪而死，并从死里复活，为您战胜了死亡。",
      "salvation.teaching.step2.verse": "“神爱世人，甚至将祂的独生子赐给他们...”",
      
      "salvation.teaching.step3.title": "宣告",
      "salvation.teaching.step3.body": "凭着信心宣告。当你口里承认，心里相信，救恩就是你的了。",
      "salvation.teaching.step3.verse": "“你若口里认耶稣为主... 就必得救。”",
      
      "salvation.teaching.prayer.eyebrow": "决志祷告",
      "salvation.teaching.prayer.body_pt1": "“亲爱的上帝，我知道我是一个罪人，我请求祢的饶恕。我相信耶稣基督是祢的儿子。我相信祂为我的罪而死，并从死里复活。从今以后，我愿信靠并跟随祂，尊祂为我的生命主宰和救主。奉耶稣的名祷告，",
      "salvation.teaching.prayer.amen": "阿们。",
      "salvation.teaching.prayer.body_pt2": "”",

      "salvation.faq.eyebrow": "有疑问吗？",
      "salvation.faq.title": "常见问题",
      "salvation.faq.q1": "得救是什么意思？",
      "salvation.faq.a1": "得救意味着借着耶稣基督，你从罪的惩罚中被拯救出来，并进入与神活生生的关系中——这并不是靠你自己的好行为，而是靠祂为你所成就的。",
      "salvation.faq.q2": "我需要先变得完美吗？",
      "salvation.faq.a2": "不需要。救恩是恩典的礼物，而非对完美的奖赏。神就照着你现在的本相接纳你。我们是因信得救，不是因着自己的行为或努力。",
      "salvation.faq.q3": "接受耶稣后我又犯错怎么办？",
      "salvation.faq.a3": "神的恩典大过任何过犯。当我们跌倒时，我们可以诚实地承认我们的罪，祂是信实的，必赦免我们的罪，使我们完全得恢复。",
      "salvation.faq.q4": "我该如何在信仰中成长？",
      "salvation.faq.a4": "每天读圣经、诚心地祷告、融入信徒群体，并寻找服侍他人的机会。这些习惯将建立能改变你一生的关系。",
      "salvation.faq.q5": "提交决定后会怎样？",
      "salvation.faq.a5": "我们的一位团队成员会亲自联系您，陪伴您开启这段新旅程。您不再孤单——这只是开始。",

      "salvation.form.eyebrow": "迈出第一步",
      "salvation.form.title": "我已作决定",
      "salvation.form.subtitle": "请让我们知道——我们非常乐意与您一同庆祝，并竭力支持您的下一步。",
      
      "salvation.form.decision1.label": "🙏  我今天决定跟随耶稣",
      "salvation.form.decision1.desc": "这是我第一次委身于基督",
      "salvation.form.decision2.label": "📖  我想了解更多",
      "salvation.form.decision2.desc": "我很好奇，并希望能获得更多指引",
      "salvation.form.decision3.label": "✨  我需要代祷",
      "salvation.form.decision3.desc": "请支持并为我祷告",
      
      "salvation.form.first_name": "名字 (First Name)",
      "salvation.form.last_name": "姓氏 (Last Name)",
      "salvation.form.email": "电子邮件",
      "salvation.form.phone": "联络电话",
      "salvation.form.optional": "(可选)",
      "salvation.form.submit": "提交我的决定",
      "salvation.form.submitting": "提交中...",
      "salvation.form.error": "出现错误。请重试。",
      "salvation.form.alert": "请选择一项决定。",
      
      "salvation.form.success.title": "谢谢您",
      "salvation.form.success.desc": "我们已收到您的决定。我们的团队成员将亲自联系您，陪您一同走过这段新旅程。",
      
      "users.title": "用户列表",
      "users.loading": "正在加载用户...",
      "users.no_permission": "您没有权限查看此页面。",
      "users.confirm.activate": "您确定要激活此用户吗？",
      "users.confirm.deactivate": "您确定要停用此用户吗？",
      "users.alert.status_fail": "状态更新失败",
      "users.alert.no_email": "未找到此用户的电子邮件。",
      "users.confirm.reset": "发送密码重置链接至 {{email}}?",
      "users.alert.reset_success": "重置链接已发送！",
      "users.alert.reset_fail": "发送重置链接失败",
      "users.button.filters": "筛选",
      "users.search.placeholder": "按用户名、姓名或电话搜索...",
      "users.filters.title": "筛选",
      "users.filters.age_range": "年龄范围",
      "users.filters.min": "最小值",
      "users.filters.max": "最大值",
      "users.filters.clear": "清除",
      "users.filters.done": "完成",
      "users.status.active": "活跃",
      "users.status.inactive": "未激活",
      "users.button.edit": "编辑用户",
      "users.button.reset": "发送密码重置链接",
      "users.label.id": "编号:",
      "users.label.age": "年龄:",
      "users.label.phone": "电话:",
      "users.label.address": "地址:",

      "worship.band.title": "敬拜团队",
      "worship.band.roles": "角色",
      "worship.band.all_members": "所有成员",
      "worship.band.add_member": "+ 添加成员",
      "worship.band.filter_by_role": "按角色筛选:",
      "worship.band.all_roles": "所有角色",
      "worship.band.no_members_found": "未找到符合条件的团队成员。",
      "worship.band.edit_member_title": "编辑团队成员",
      "worship.band.add_member_title": "添加新团队成员",
      "worship.band.select_member": "选择成员:",
      "worship.band.select_user_placeholder": "-- 选择用户 --",
      "worship.band.search_member_placeholder": "搜索成员...",
      "worship.band.no_users_found": "未找到用户",
      "worship.band.no_members_available": "没有可供选择的成员。",
      "worship.band.label.email": "电子邮件:",
      "worship.band.label.phone": "电话:",
      "worship.band.label.sex": "性别",
      "worship.band.select_placeholder": "请选择...",
      "worship.band.male": "男",
      "worship.band.female": "女",
      "worship.band.label.age": "年龄",
      "worship.band.label.roles_skills": "角色 / 技能:",
      "worship.band.button.cancel": "取消",
      "worship.band.button.saving": "保存中...",
      "worship.band.button.update_member": "更新成员",
      "worship.band.button.add_member": "添加成员",
      "worship.band.loading_team": "正在加载团队信息...",
      "worship.band.alert.select_member": "请从列表中选择一个成员。",
      "worship.band.alert.failed_update": "更新成员失败",
      "worship.band.alert.failed_add": "添加成员失败",
      "worship.band.chat_whatsapp": "在 WhatsApp 上聊天"
    }
  }
};

// Retrieve saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('appLanguage') || 'en';

i18n
  .use(initReactI18next) // Bind to React
  .init({
    resources,
    lng: savedLanguage,          // Default language
    fallbackLng: 'en',   // Fallback if key is missing
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

// Listen for language changes to update localStorage automatically
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('appLanguage', lng);
});

export default i18n;
