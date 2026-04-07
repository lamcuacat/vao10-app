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
        <option value="Hà Nội - Amsterdam (0000)" />
         <option value="Chu Văn An (0001)" />
         <option value="Phạm Hồng Thái (0103)" />
         <option value="Nguyễn Trãi - Ba Đình (0104)" />
         <option value="Tây Hồ (0105)" />
         <option value="Kim Liên (0202)" />
         <option value="Lê Quý Đôn - Đống Đa (0803)" />
         <option value="Đống Đa (0804)" />
         <option value="Quang Trung - Đống Đa (0805)" />
         <option value="Khương Đình (1321)" />
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
