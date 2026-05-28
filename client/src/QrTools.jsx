import React from 'react';
import QRCode from 'qrcode';
import { Download, QrCode } from 'lucide-react';

export const QR_TOOLS = [
  { id: 'text-qr', title: 'Text / URL QR Code', description: 'Generate QR code from text or link.' },
  { id: 'wifi-qr', title: 'WiFi QR Code', description: 'Generate QR for WiFi sharing.' },
  { id: 'whatsapp-qr', title: 'WhatsApp QR Code', description: 'Generate WhatsApp chat QR.' },
  { id: 'upi-qr', title: 'UPI QR Code', description: 'Generate Indian UPI payment QR.' },
  { id: 'email-qr', title: 'Email QR Code', description: 'Generate email QR code.' }
];

export default function QrTools({ tool }) {
  const canvasRef = React.useRef(null);
  const [form, setForm] = React.useState({ text: '', ssid: '', password: '', phone: '', message: '', upi: '', name: '', amount: '', email: '', subject: '' });
  const [error, setError] = React.useState('');
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  function buildValue() {
    if (tool.id === 'wifi-qr') return `WIFI:T:WPA;S:${form.ssid};P:${form.password};;`;
    if (tool.id === 'whatsapp-qr') return `https://wa.me/${form.phone.replace(/\D/g, '')}?text=${encodeURIComponent(form.message)}`;
    if (tool.id === 'upi-qr') {
      const params = new URLSearchParams({ pa: form.upi, pn: form.name || 'Payment', cu: 'INR' });
      if (form.amount) params.set('am', form.amount);
      return `upi://pay?${params.toString()}`;
    }
    if (tool.id === 'email-qr') return `mailto:${form.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(form.message)}`;
    return form.text;
  }

  async function generate() {
    setError('');
    try {
      const value = buildValue();
      if (!value.trim()) throw new Error('Please enter details first.');
      await QRCode.toCanvas(canvasRef.current, value, { width: 320, margin: 2, errorCorrectionLevel: 'H' });
    } catch (err) {
      setError(err.message || 'QR generation failed.');
    }
  }

  function download() {
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.id}.png`;
    a.click();
  }

  return (
    <div className="workspace">
      {tool.id === 'text-qr' ? <label className="input-group"><span>Text or URL</span><textarea value={form.text} onChange={e => set('text', e.target.value)} /></label> : null}
      {tool.id === 'wifi-qr' ? <div className="input-grid"><label className="input-group"><span>WiFi Name</span><input value={form.ssid} onChange={e => set('ssid', e.target.value)} /></label><label className="input-group"><span>Password</span><input value={form.password} onChange={e => set('password', e.target.value)} /></label></div> : null}
      {tool.id === 'whatsapp-qr' ? <div className="input-grid"><label className="input-group"><span>Phone with country code</span><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="919876543210" /></label><label className="input-group"><span>Message</span><input value={form.message} onChange={e => set('message', e.target.value)} /></label></div> : null}
      {tool.id === 'upi-qr' ? <div className="input-grid"><label className="input-group"><span>UPI ID</span><input value={form.upi} onChange={e => set('upi', e.target.value)} placeholder="name@upi" /></label><label className="input-group"><span>Name</span><input value={form.name} onChange={e => set('name', e.target.value)} /></label><label className="input-group"><span>Amount Optional</span><input value={form.amount} onChange={e => set('amount', e.target.value)} /></label></div> : null}
      {tool.id === 'email-qr' ? <div className="input-grid"><label className="input-group"><span>Email</span><input value={form.email} onChange={e => set('email', e.target.value)} /></label><label className="input-group"><span>Subject</span><input value={form.subject} onChange={e => set('subject', e.target.value)} /></label><label className="input-group"><span>Message</span><input value={form.message} onChange={e => set('message', e.target.value)} /></label></div> : null}

      <div className="actions"><button className="primary-btn" onClick={generate}><QrCode size={18} /> Generate QR</button><button className="secondary-btn" onClick={download}><Download size={18} /> Download PNG</button></div>
      {error ? <div className="error">{error}</div> : null}
      <div className="qr-preview"><canvas ref={canvasRef} /></div>
    </div>
  );
}
