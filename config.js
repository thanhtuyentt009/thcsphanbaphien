// ==========================================
// 1. CẤU HÌNH HỆ THỐNG (THAY ĐỔI TẠI ĐÂY)
// ==========================================
const CONFIG = {
    // Đường link Google Apps Script
    GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwhDm8AmwYt77sbv_iXtIqVw_PbFhxNP7SfWVU31NNjbPyZNaHrpqLyZ7pv665hn694/exec",
    
    // Mật khẩu đăng nhập dành cho giáo viên
    ADMIN_PASS: "123456",
    
    // Năm học hiển thị
    SCHOOL_YEAR: "2025-2026",
    
    // Khai báo tên trường (Đã sửa thành viết hoa SCHOOL_NAME)
    SCHOOL_NAME: "THCS Phan Bá Phiến"
};

// ==========================================
// 2. KIỂM TRA QUYỀN TRUY CẬP (BẢO MẬT)
// ==========================================
function checkAccess() {
    const name = sessionStorage.getItem('exam_name');
    const school = sessionStorage.getItem('exam_school');
    
    if (!name || !school) {
        alert("⚠️ Vui lòng nhập thông tin đầy đủ trước khi bắt đầu làm bài!");
        window.location.href = "index.html"; 
        return;
    }

    if (!sessionStorage.getItem('startTime')) {
        const now = new Date();
        sessionStorage.setItem('startTime', now.toLocaleString('vi-VN'));
        sessionStorage.setItem('startTimeMs', now.getTime()); 
    }
}

// ==========================================
// 3. TÍNH TOÁN THỜI GIAN LÀM BÀI
// ==========================================
function calculateTimeElapsed() {
    const startMs = sessionStorage.getItem('startTimeMs');
    if (!startMs) return "Không xác định";
    
    const endMs = new Date().getTime();
    const diffSeconds = Math.floor((endMs - parseInt(startMs)) / 1000);
    
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    
    return `${minutes} phút ${seconds} giây`;
}

function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Windows")) return "Máy tính (Windows)";
    if (userAgent.includes("Mac")) return "Máy tính (Mac/Apple)";
    if (userAgent.includes("Android")) return "Điện thoại (Android)";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) return "Điện thoại (iOS)";
    return "Thiết bị khác";
}

// ==========================================
// 4. GỬI DỮ LIỆU BÀI THI LÊN GOOGLE SHEETS
// ==========================================
async function submitExamData(results) {
    if (!CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL.includes("LINK_WEB_APP")) {
        console.error("Lỗi: Chưa cấu hình GOOGLE_SCRIPT_URL trong config.js");
        return { status: "error", message: "Hệ thống chưa được kết nối với máy chủ!" };
    }

    // Đóng gói dữ liệu gửi đi
    const payload = {
        action: "submitExam", // Thêm action để Code.gs biết là nộp bài
        timeStart: sessionStorage.getItem('startTime') || new Date().toLocaleString('vi-VN'),
        timeEnd: new Date().toLocaleString('vi-VN'),
        timeTaken: calculateTimeElapsed(), 
        name: sessionStorage.getItem('exam_name'),
        className: sessionStorage.getItem('exam_class'),
        school: sessionStorage.getItem('exam_school'),
        deviceInfo: getDeviceInfo(),
        location: "Trình duyệt Web",
        
        // Dữ liệu điểm số
        scoreTNLQ: results.scoreTNLQ || 0,
        scoreTF: results.scoreTF || 0,
        scoreShort: results.scoreShort || 0,
        essay: results.essay || "Đã nộp",
        correct: results.correctCount || 0,
        totalScore: results.totalScore || 0,
        
        // MÃ HÓA BÀI LÀM
        answersCode: results.answersCode || "" 
    };

    try {
        await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 
                'Content-Type': 'text/plain;charset=utf-8' 
            },
            body: JSON.stringify(payload)
        });
        
        sessionStorage.removeItem('startTime');
        sessionStorage.removeItem('startTimeMs');

        return { status: "success" };
    } catch (error) {
        console.error("Lỗi khi nộp bài:", error);
        return { status: "error", message: "Đường truyền mạng không ổn định. Vui lòng thử nộp lại!" };
    }
}

// ==========================================
// 5. ĐĂNG XUẤT
// ==========================================
function clearSession() {
    sessionStorage.clear();
    window.location.href = "index.html";
}
