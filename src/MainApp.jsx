import React, { useState, useEffect, useRef } from 'react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2s0X7qsvCjjkSJlJD5uq9ukzvS_IzRz97JRYyvtPdI5Z9iu15YvBlSTxIZliAf9rrvA/exec";

export default function MainApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    nv1: '', nv2: '', nv3: '',
    thunghiem: false, vneid2: false, cccd: false, khaisinh: false, hocba: false,
    anhthe: false, minhchung: false, uutien: false, giaytntam: false, phieudutuyen: false,
    lephi: false, xacnhan: false,
    sdtPhuHuynh: '', maHocSinh: '', passSoGD: '', diemT3: '', diemT4: ''
  });
  
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  
  const chatEndRef = useRef(null);

  const phone = localStorage.getItem('vao10_phone') || '';
  const apiKey = localStorage.getItem('vao10_apikey') || '';
  const parentName = localStorage.getItem('vao10_parent') || '';
  const childName = localStorage.getItem('vao10_child') || '';

  // Khôi phục SĐT vào form data
  useEffect(() => {
    setData(prev => ({...prev, sdtPhuHuynh: phone}));
  }, [phone]);

  useEffect(() => {
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getInitialData", phone, fatherName: parentName, childName })
    }).then(res => res.json()).then(res => {
      if (res.data) setData(prev => ({...prev, ...res.data}));
      if (res.chatHistory) setChatHistory(res.chatHistory.map(c => ({ user: parentName, question: c.question, answer: c.answer })));
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [phone, childName, parentName]);

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const handleChange = (field, value) => {
    setData(prev => ({...prev, [field]: value}));
  };

  const saveData = () => {
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "saveData", phone, data })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) showAlert("✅ LƯU THÀNH CÔNG!");
      else showAlert("⚠️ CHƯA LƯU ĐƯỢC: " + res.error);
    }).catch(err => showAlert("Lỗi kết nối!"));
  };

  const handleCopyDraft = () => {
    const text = `📝 TỜ NHÁP ĐIỆN TỬ -
============================
1. THÔNG TIN HỌC SINH
- Mã Học Sinh: ${data.maHocSinh || "(Chưa nhập)"}
- Điện Thoại PH: ${data.sdtPhuHuynh || "(Chưa nhập)"}

2. CHIẾN LƯỢC NGUYỆN VỌNG
- NV1: ${data.nv1 || "(Chưa chốt)"}
- NV2: ${data.nv2 || "(Chưa chốt)"}
- NV3: ${data.nv3 || "(Chưa chốt)"}
============================
(Tuyệt đối không đổi phút chót!)`;
    navigator.clipboard.writeText(text).then(() => {
      showAlert("✅ Đã copy Tờ nháp thành công!");
      setShowModal(false);
    });
  };

  const sendToAI = async () => {
    if (!question.trim()) return;
    const currentQ = question;
    const newChat = [...chatHistory, { user: parentName, question: currentQ, answer: null }];
    setChatHistory(newChat);
    setQuestion("");
    setAiThinking(true);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "askAI", phone, question: currentQ,
          chatContext: chatHistory.map(c => `Phụ huynh: ${c.question}\nAI: ${c.answer}`).join("\n"),
          apiKey, names: { parentName, childName, nv1: data.nv1, nv2: data.nv2, nv3: data.nv3 }
        })
      });
      const resJSON = await response.json();
      const updatedChat = [...newChat];
      updatedChat[updatedChat.length - 1].answer = resJSON.answer || "Lỗi AI.";
      setChatHistory(updatedChat);
    } catch(err) {
      showAlert("Lỗi khi kết nối AI!");
    }
    setAiThinking(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, aiThinking, activeTab]);

  if (isLoading) return <div className="text-center mt-5 spinner-border text-primary"></div>;

  return (
    <div className="container" style={{ maxWidth: '600px', margin: 'auto', paddingBottom: '70px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <div className="text-center mb-4 p-3" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white', borderRadius: '0 0 20px 20px' }}>
        <h3 className="fw-bold mb-1">🚀 CÙNG CON VÀO 10</h3>
        <p className="mb-0 small">Bản lĩnh tự tin • Tối ưu quyết định • Chắc suất trường ngon!</p>
        <button className="btn btn-sm btn-outline-light mt-2 rounded-pill" onClick={onLogout}>🚪 Đăng xuất ({phone})</button>
      </div>

      {/* NAV TABS */}
      <div className="d-flex justify-content-between mb-4 bg-white p-2" style={{ borderRadius: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', gap: '4px' }}>
        <button className={`btn flex-fill ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-light'} rounded-pill`} onClick={() => setActiveTab('dashboard')}>🎯 Chiến Lược</button>
        <button className={`btn flex-fill ${activeTab === 'account' ? 'btn-primary' : 'btn-light'} rounded-pill`} onClick={() => setActiveTab('account')}>🔐 Hồ Sơ</button>
        <button className={`btn flex-fill ${activeTab === 'ai' ? 'btn-primary' : 'btn-light'} rounded-pill`} onClick={() => setActiveTab('ai')}>✨ AI Live</button>
      </div>

      {/* DỮ LIỆU DANH SÁCH TRƯỜNG CHUNG */}
      <datalist id="danhSachTruong">
    <option value="Nguyễn Trãi - Ba Đình (0101)" />
    <option value="Phạm Hồng Thái (0102)" />
    <option value="Phan Đình Phùng (0103)" />
    <option value="Chu Văn An (2401)" />
    <option value="Tây Hồ (2402)" />
    <option value="Đoàn Kết - Hai Bà Trưng (1101)" />
    <option value="Thăng Long (1102)" />
    <option value="Trần Nhân Tông (1103)" />
    <option value="Trần Phú - Hoàn Kiếm (1301)" />
    <option value="Việt Đức (1302)" />
    <option value="Chuyên Hà Nội - Amsterdam (0401)" />
    <option value="Cầu Giấy (0402)" />
    <option value="Yên Hòa (0403)" />
    <option value="Đống Đa (0801)" />
    <option value="Kim Liên (0802)" />
    <option value="Lê Quý Đôn - Đống Đa (0803)" />
    <option value="Quang Trung - Đống Đa (0804)" />
    <option value="Nhân Chính (2801)" />
    <option value="Trần Hưng Đạo - Thanh Xuân (2802)" />
    <option value="Khương Đình (2803)" />
    <option value="Khương Hạ (2804)" />
    <option value="Hoàng Văn Thụ (1401)" />
    <option value="Trương Định (1402)" />
    <option value="Việt Nam - Ba Lan (1403)" />
    <option value="Ngọc Hồi (2701)" />
    <option value="Ngô Thì Nhậm (2702)" />
    <option value="Đông Mỹ (2703)" />
    <option value="Nguyễn Quốc Trinh (2704)" />
    <option value="Cao Bá Quát - Gia Lâm (0901)" />
    <option value="Dương Xá (0902)" />
    <option value="Nguyễn Văn Cừ (0903)" />
    <option value="Yên Viên (0904)" />
    <option value="Lý Thường Kiệt (1501)" />
    <option value="Nguyễn Gia Thiều (1502)" />
    <option value="Phúc Lợi (1503)" />
    <option value="Thạch Bàn (1504)" />
    <option value="Bắc Thăng Long (0701)" />
    <option value="Cổ Loa (0702)" />
    <option value="Đông Anh (0703)" />
    <option value="Liên Hà (0704)" />
    <option value="Vân Nội (0705)" />
    <option value="Mê Linh (1601)" />
    <option value="Quang Minh (1602)" />
    <option value="Tiền Phong (1603)" />
    <option value="Tiến Thịnh (1604)" />
    <option value="Tự Lập (1605)" />
    <option value="Yên Lãng (1606)" />
    <option value="Đa Phúc (2201)" />
    <option value="Kim Anh (2202)" />
    <option value="Minh Phú (2203)" />
    <option value="Sóc Sơn (2204)" />
    <option value="Trung Giã (2205)" />
    <option value="Xuân Giang (2206)" />
    <option value="Nguyễn Thị Minh Khai (0301)" />
    <option value="Thượng Cát (0302)" />
    <option value="Xuân Đỉnh (0303)" />
    <option value="Đại Mỗ (1801)" />
    <option value="Trung Văn (1802)" />
    <option value="Xuân Phương (1803)" />
    <option value="Mỹ Đình (1804)" />
    <option value="Đan Phượng (0601)" />
    <option value="Hồng Thái (0602)" />
    <option value="Tân Lập (0603)" />
    <option value="Thọ Xuân (0604)" />
    <option value="Hoài Đức A (1201)" />
    <option value="Hoài Đức B (1202)" />
    <option value="Vạn Xuân - Hoài Đức (1203)" />
    <option value="Hoài Đức C (1204)" />
    <option value="Ba Vì (0201)" />
    <option value="Bất Bạt (0202)" />
    <option value="Minh Quang (0203)" />
    <option value="Ngô Quyền - Ba Vì (0204)" />
    <option value="Quảng Oai (0205)" />
    <option value="Dân Tộc Nội Trú (0206)" />
    <option value="Ngọc Tảo (2001)" />
    <option value="Phúc Thọ (2002)" />
    <option value="Vân Cốc (2003)" />
    <option value="Sơn Tây (2301)" />
    <option value="Tùng Thiện (2302)" />
    <option value="Xuân Khanh (2303)" />
    <option value="Cao Bá Quát - Quốc Oai (2101)" />
    <option value="Minh Khai (2102)" />
    <option value="Quốc Oai (2103)" />
    <option value="Phan Huy Chú - Quốc Oai (2104)" />
    <option value="Bắc Lương Sơn (2501)" />
    <option value="Hai Bà Trưng - Thạch Thất (2502)" />
    <option value="Phùng Khắc Khoan (2503)" />
    <option value="Thạch Thất (2504)" />
    <option value="Minh Hà (2505)" />
    <option value="Chúc Động (0501)" />
    <option value="Chương Mỹ A (0502)" />
    <option value="Chương Mỹ B (0503)" />
    <option value="Xuân Mai (0504)" />
    <option value="Nguyễn Văn Trỗi (0505)" />
    <option value="Chuyên Nguyễn Huệ (1001)" />
    <option value="Lê Quý Đôn - Hà Đông (1003)" />
    <option value="Quang Trung - Hà Đông (1004)" />
    <option value="Trần Hưng Đạo - Hà Đông (1005)" />
    <option value="Nguyễn Du - Thanh Oai (2601)" />
    <option value="Thanh Oai A (2602)" />
    <option value="Thanh Oai B (2603)" />
    <option value="Đồng Quan (1901)" />
    <option value="Phú Xuyên A (1902)" />
    <option value="Phú Xuyên B (1903)" />
    <option value="Tân Dân (1904)" />
    <option value="Lý Tử Tấn (2901)" />
    <option value="Nguyễn Trãi - Thường Tín (2902)" />
    <option value="Tô Hiệu - Thường Tín (2903)" />
    <option value="Thường Tín (2904)" />
    <option value="Vân Tảo (2905)" />
    <option value="Hợp Thanh (1701)" />
    <option value="Mỹ Đức A (1702)" />
    <option value="Mỹ Đức B (1703)" />
    <option value="Mỹ Đức C (1704)" />
    <option value="Đại Cường (3001)" />
    <option value="Lưu Hoàng (3002)" />
    <option value="Trần Đăng Ninh (3003)" />
    <option value="Ứng Hòa A (3004)" />
    <option value="Ứng Hòa B (3005)" />
</datalist>

      {/* TAB: CHIẾN LƯỢC NGUYỆN VỌNG */}
      {activeTab === 'dashboard' && (
        <>
          <div className="card shadow-sm mb-3 border-0" style={{ borderRadius: '20px' }}>
            <div className="card-header bg-white border-0 pt-4"><h5 className="fw-bold text-primary mb-0">1. CHỐT NGUYỆN VỌNG</h5></div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label text-danger fw-bold">NV 1 (Mơ ước):</label>
                <input list="danhSachTruong" className="form-control text-danger fw-bold" value={data.nv1} onChange={e => handleChange('nv1', e.target.value)} placeholder="Chọn trường NV1..." />
              </div>
              <div className="mb-3">
                <label className="form-label text-warning fw-bold">NV 2 (An toàn):</label>
                <input list="danhSachTruong" className="form-control text-warning fw-bold" value={data.nv2} onChange={e => handleChange('nv2', e.target.value)} placeholder="Chọn trường NV2..." />
              </div>
              <div className="mb-3">
                <label className="form-label text-success fw-bold">NV 3 (Chắc chắn):</label>
                <input list="danhSachTruong" className="form-control text-success fw-bold" value={data.nv3} onChange={e => handleChange('nv3', e.target.value)} placeholder="Chọn trường NV3..." />
              </div>
            </div>
          </div>

          <div className="card shadow-sm mb-3 border-0" style={{ borderRadius: '20px' }}>
            <div className="card-header bg-white border-0 pt-4"><h5 className="fw-bold text-primary mb-0">2. CHECKLIST HỒ SƠ</h5></div>
            <div className="card-body">
              {[
                { id: 'vneid2', label: 'Tài khoản VNeID Mức 2' },
                { id: 'cccd', label: 'Bản chụp CCCD (2 mặt)' },
                { id: 'khaisinh', label: 'Bản chụp Giấy khai sinh' },
                { id: 'hocba', label: 'Bản chụp Học bạ THCS' },
                { id: 'anhthe', label: 'Ảnh thẻ 4x6 và 3x4' },
                { id: 'minhchung', label: 'Minh chứng cư trú' },
              ].map(item => (
                <div className="form-check mb-2" key={item.id}>
                  <input className="form-check-input" type="checkbox" id={item.id} checked={data[item.id]} onChange={e => handleChange(item.id, e.target.checked)} />
                  <label className="form-check-label" htmlFor={item.id}>{item.label}</label>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-warning w-100 fw-bold mb-3 rounded-4 shadow-sm" style={{ padding: '14px' }} onClick={() => setShowModal(true)}>📝 XEM & COPY TỜ NHÁP</button>
          <button className="btn btn-primary w-100 fw-bold mb-4 rounded-4 shadow-sm" style={{ padding: '14px', background: '#1e3c72' }} onClick={saveData}>💾 LƯU BẢNG CHỐT</button>
        </>
      )}

      {/* TAB: HỒ SƠ & TÀI KHOẢN */}
      {activeTab === 'account' && (
        <>
          <div className="card shadow-sm mb-3 border-0" style={{ borderRadius: '20px' }}>
            <div className="card-header bg-white border-0 pt-4"><h5 className="fw-bold text-primary mb-0">🔑 THÔNG TIN ĐĂNG NHẬP SỞ</h5></div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label fw-bold">Điện thoại PH:</label><input type="text" className="form-control fw-bold" value={data.sdtPhuHuynh} disabled /></div>
              <div className="mb-3"><label className="form-label fw-bold">Mã Học Sinh:</label><input type="text" className="form-control fw-bold text-primary" value={data.maHocSinh} onChange={e => handleChange('maHocSinh', e.target.value)} placeholder="01234..." /></div>
              <div className="mb-3"><label className="form-label fw-bold">Mật khẩu cổng Sở (Mới):</label><input type="password" className="form-control" value={data.passSoGD} onChange={e => handleChange('passSoGD', e.target.value)} placeholder="••••••" /></div>
            </div>
          </div>

          <div className="card shadow-sm mb-3 border-0" style={{ borderRadius: '20px' }}>
            <div className="card-header bg-white border-0 pt-4"><h5 className="fw-bold text-primary mb-0">📈 ĐIỂM THI THỬ</h5></div>
            <div className="card-body">
              <div className="row">
                <div className="col-6"><label className="form-label fw-bold">Tháng 3:</label><input type="number" step="0.25" className="form-control text-center" value={data.diemT3} onChange={e => handleChange('diemT3', e.target.value)} placeholder="VD: 39" /></div>
                <div className="col-6"><label className="form-label fw-bold">Tháng 4:</label><input type="number" step="0.25" className="form-control text-center" value={data.diemT4} onChange={e => handleChange('diemT4', e.target.value)} placeholder="VD: 41" /></div>
              </div>
            </div>
          </div>
          <button className="btn btn-primary w-100 fw-bold mb-4 rounded-4 shadow-sm" style={{ padding: '14px', background: '#1e3c72' }} onClick={saveData}>💾 LƯU THÔNG TIN</button>
        </>
      )}

      {/* TAB: CỐ VẤN AI */}
      {activeTab === 'ai' && (
        <div className="card shadow-sm border-0" style={{ borderRadius: '20px', height: '600px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header bg-white pt-3 border-0">
            <h5 className="fw-bold mb-0">Cố vấn Tuyển sinh AI (Live)</h5>
            <small className="text-success fw-bold">Trợ lý riêng cho sĩ tử {childName}</small>
          </div>
          <div className="card-body p-3" style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
            {chatHistory.map((chat, i) => (
              <div key={i} className="mb-3">
                <div className="d-flex justify-content-end mb-2">
                  <div className="p-2 px-3 text-white shadow-sm" style={{ background: '#1e3c72', borderRadius: '15px 15px 0 15px', maxWidth: '85%' }}>{chat.question}</div>
                </div>
                {chat.answer && (
                  <div className="d-flex justify-content-start">
                    <div className="p-2 px-3 bg-white border shadow-sm" style={{ borderRadius: '15px 15px 15px 0', maxWidth: '85%' }}>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: '0.95rem' }}>{chat.answer}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {aiThinking && <div className="text-muted small fst-italic">✨ AI đang suy nghĩ...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="card-footer bg-white border-0 p-3">
            <div className="d-flex gap-2">
              <input 
                type="text" className="form-control" placeholder="Hỏi Cố vấn tư vấn điểm..." 
                value={question} onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendToAI()}
                style={{ borderRadius: '20px', background: '#f1f5f9' }}
              />
              <button className="btn btn-primary fw-bold" style={{ borderRadius: '20px', padding: '0 20px', background: '#1e3c72' }} onClick={sendToAI} disabled={aiThinking}>Gửi</button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT THÔNG BÁO GLOBAL */}
      {alertMsg && (
        <div className="alert alert-success mt-4 text-center shadow" style={{ position: 'fixed', bottom: '30px', left: '5%', right: '5%', zIndex: 1050, borderRadius: '12px', fontWeight: 'bold' }}>
          {alertMsg}
        </div>
      )}

      {/* MODAL TỜ NHÁP */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div className="modal-header" style={{ background: '#1e3c72', color: 'white', borderRadius: '20px 20px 0 0' }}>
                  <h5 className="modal-title fw-bold">📝 TỜ NHÁP ĐIỆN TỬ</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4 bg-light">
                  <div className="alert alert-info py-2" style={{ fontSize: '0.85rem' }}>💡 Sao chép để Paste thẳng vào form Đăng ký của Sở.</div>
                  <pre
                    className="form-control mb-3 p-3"
                    style={{ fontSize: '0.95rem', borderRadius: '12px', background: '#fff', whiteSpace: 'pre-wrap' }}
                  >
{`1. THÔNG TIN HỌC SINH
- Mã HS: ${data.maHocSinh || "(Chưa nhập)"}
- ĐT PH: ${data.sdtPhuHuynh || "(Chưa nhập)"}

2. CHIẾN LƯỢC NGUYỆN VỌNG
- NV1: ${data.nv1 || "(Chưa chốt)"}
- NV2: ${data.nv2 || "(Chưa chốt)"}
- NV3: ${data.nv3 || "(Chưa chốt)"}`}
                  </pre>
                  <button className="btn btn-success fw-bold w-100 rounded-4 shadow-sm" style={{ padding: '12px' }} onClick={handleCopyDraft}>📋 COPY TOÀN BỘ</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
