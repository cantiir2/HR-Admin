import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import {
  Download, FileText, IdCard, Image, Loader2,
  Plus, Save, Shield, Trash2, Upload, User, UsersRound, BriefcaseBusiness
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppAlert from '../components/AppAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import UserAvatar from '../components/UserAvatar';
import AppSelect from '../components/AppSelect';
import { parseWorkingExperience, stringifyWorkingExperience } from '../lib/profileFormat';

const emptyForm = {
  phone: '', address: '', birthDate: '', birthPlace: '', gender: '',
  religion: '', maritalStatus: '', education: '', workingExperience: '',
  skill: '', emergencyContactName: '', emergencyContactPhone: '',
  fatherName: '', motherName: '', ktpNumber: '', kkNumber: ''
};

const documentTypes = [
  { value: 'KTP', label: 'KTP' },
  { value: 'KK', label: 'Kartu Keluarga' },
  { value: 'LAINNYA', label: 'Dokumen Lainnya' }
];

const MemberProfile = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [experiences, setExperiences] = useState([]);
  const [initialExperiences, setInitialExperiences] = useState([]);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [religions, setReligions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [documentType, setDocumentType] = useState('LAINNYA');
  const [documentLabel, setDocumentLabel] = useState('');
  const [confirm, setConfirm] = useState(null);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm) ||
      JSON.stringify(experiences) !== JSON.stringify(initialExperiences),
    [form, initialForm, experiences, initialExperiences]
  );

  const buildForm = (data) => ({
    phone: data.phone || '',
    address: data.address || '',
    birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
    birthPlace: data.birthPlace || '',
    gender: data.gender || '',
    religion: data.religion || '',
    maritalStatus: data.maritalStatus || '',
    education: data.education || '',
    workingExperience: data.workingExperience || '',
    skill: data.skill || '',
    emergencyContactName: data.emergencyContactName || '',
    emergencyContactPhone: data.emergencyContactPhone || '',
    fatherName: data.fatherName || '',
    motherName: data.motherName || '',
    ktpNumber: '',
    kkNumber: ''
  });

  const fetchProfile = async () => {
    const res = await api.get('/api/users/me/profile');
    const nextForm = buildForm(res.data);
    const nextExperiences = res.data.jobHistories?.length
      ? res.data.jobHistories.map(item => ({
          id: item.id, companyName: item.companyName, role: item.jobTitle,
          detail: item.description || '', startDate: item.startDate?.split('T')[0] || '',
          endDate: item.endDate?.split('T')[0] || '', isPresent: item.isPresent
        }))
      : parseWorkingExperience(res.data.workingExperience);
    setProfile(res.data);
    setForm(nextForm);
    setInitialForm(nextForm);
    setExperiences(nextExperiences);
    setInitialExperiences(nextExperiences);
  };

  const fetchReligions = async () => {
    const res = await api.get('/api/system?category=RELIGION');
    setReligions(res.data);
  };

  useEffect(() => {
    // Existing screen pattern: initial API hydration updates local form state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
    fetchReligions();
  }, []);

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const submitProfile = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.put('/api/users/me/profile', {
        ...form,
        workingExperience: stringifyWorkingExperience(experiences)
      });
      await Promise.all(experiences.filter(item => item.companyName || item.role).map(item => {
        const payload = {
          companyName: item.companyName, jobTitle: item.role, description: item.detail,
          startDate: item.startDate, endDate: item.endDate, isPresent: item.isPresent
        };
        return item.id
          ? api.put(`/api/users/me/job-histories/${item.id}`, payload)
          : api.post('/api/users/me/job-histories', payload);
      }));
      await fetchProfile();
      await refreshUser();
      setMessage('Data karyawan berhasil diperbarui');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setConfirm({
      title: 'Update Profil',
      message: 'Simpan perubahan data karyawan ini?',
      confirmLabel: 'Ya, Simpan',
      onConfirm: submitProfile
    });
  };

  const uploadFile = async (file, type) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10MB');
      return;
    }

    setUploading(type);
    setError('');
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        if (type === 'CV') {
          const res = await api.post('/api/users/me/cv', {
            cvFile: reader.result,
            cvFileName: file.name,
            label: documentLabel || 'Curriculum Vitae'
          });
          if (res.data.parsed && Object.keys(res.data.parsed).length > 0) {
            setParsedData(res.data.parsed);
          }
        } else {
          await api.post('/api/users/me/documents', {
            fileData: reader.result,
            fileName: file.name,
            fileType: file.type,
            documentType: type,
            label: type === 'FOTO' ? 'Foto Profil' : documentLabel
          });
        }
        await fetchProfile();
        await refreshUser();
        setMessage('File berhasil diupload');
        setDocumentLabel('');
      } catch (err) {
        setError(err.response?.data?.error || 'Gagal mengupload file');
      } finally {
        setUploading('');
      }
    };
    reader.readAsDataURL(file);
  };

  const applyParsedData = () => {
    if (!parsedData) return;
    setForm(prev => ({
      ...prev,
      phone: parsedData.phone || prev.phone,
      address: parsedData.address || prev.address,
      gender: parsedData.gender || prev.gender,
      religion: parsedData.religion || prev.religion,
      education: parsedData.education || prev.education
    }));
    setParsedData(null);
    setMessage('Data dari CV diterapkan. Silakan review lalu simpan.');
  };

  const downloadDocument = async (doc) => {
    const res = await api.get(`/api/users/me/files/${doc.id}/download`);
    downloadBase64(res.data.fileData, res.data.fileName);
  };

  const addExperience = () => {
    setExperiences(prev => [
      ...prev,
      { companyName: '', role: '', detail: '', startDate: '', endDate: '', isPresent: false }
    ]);
  };

  const updateExperience = (index, field, value) => {
    setExperiences(prev => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const removeExperience = (index) => {
    setConfirm({
      title: 'Hapus Pengalaman',
      message: 'Hapus section pengalaman kerja ini dari form?',
      confirmLabel: 'Hapus',
      tone: 'danger',
      onConfirm: async () => {
        const item = experiences[index];
        if (item.id) await api.delete(`/api/users/me/job-histories/${item.id}`);
        setExperiences(prev => prev.filter((_, itemIndex) => itemIndex !== index));
        setMessage('Riwayat pekerjaan berhasil dihapus');
      }
    });
  };


  if (!profile) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <Loader2 size={24} className="text-brand-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-8 animate-fade-in">
      <AppAlert tone="success" message={message} />
      <AppAlert tone="error" message={error} />

      <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-5">
        <UserAvatar name={profile.name} photo={profile.profilePhoto} size="lg" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">{profile.name}</h2>
          <p className="text-sm text-surface-400">{profile.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="badge-info">{profile.role}</span>
            {profile.jobRoleName && <span className="badge-success">{profile.jobRoleName}</span>}
          </div>
        </div>
        <label className="btn-ghost text-sm cursor-pointer flex items-center gap-2">
          {uploading === 'FOTO' ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />}
          Upload Foto
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => uploadFile(e.target.files[0], 'FOTO')} />
        </label>
      </div>

      {parsedData && (
        <div className="glass-card-light p-5 animate-slide-down">
          <h3 className="text-sm font-semibold text-white mb-2">Data dari CV Terdeteksi</h3>
          <div className="space-y-1 mb-3">
            {Object.entries(parsedData).map(([key, val]) => (
              <p key={key} className="text-xs text-surface-400"><span className="text-surface-300 font-medium">{key}:</span> {val}</p>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={applyParsedData} className="btn-primary text-xs">Terapkan ke Form</button>
            <button onClick={() => setParsedData(null)} className="btn-ghost text-xs">Abaikan</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <Section icon={User} title="Data Pribadi">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Telepon" value={form.phone} onChange={value => setField('phone', value)} placeholder="08123456789" />
            <AppSelect label="Jenis Kelamin" value={form.gender} onChange={value => setField('gender', value)} options={[['', '- Pilih -'], ['L', 'Laki-laki'], ['P', 'Perempuan']]} />
            <Input label="Tempat Lahir" value={form.birthPlace} onChange={value => setField('birthPlace', value)} placeholder="Jakarta" />
            <Input type="date" label="Tanggal Lahir" value={form.birthDate} onChange={value => setField('birthDate', value)} />
            <AppSelect label="Agama" value={form.religion} onChange={value => setField('religion', value)} options={[['', '- Pilih -'], ...religions.filter(r => r.isActive).map(r => [r.code, `${r.code} - ${r.name}`])]} />
            <AppSelect label="Status Pernikahan" value={form.maritalStatus} onChange={value => setField('maritalStatus', value)} options={[['', '- Pilih -'], ['Belum Menikah', 'Belum Menikah'], ['Menikah', 'Menikah'], ['Cerai', 'Cerai']]} />
          </div>
          <Textarea label="Alamat" value={form.address} onChange={value => setField('address', value)} placeholder="Alamat domisili lengkap" />
          <Input label="Pendidikan Terakhir" value={form.education} onChange={value => setField('education', value)} placeholder="S1 Teknik Informatika" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label={`Nomor KTP ${profile.ktpNumberMasked ? `(${profile.ktpNumberMasked})` : ''}`} value={form.ktpNumber} onChange={value => setField('ktpNumber', value)} placeholder="16 digit" />
            <Input label={`Nomor KK ${profile.kkNumberMasked ? `(${profile.kkNumberMasked})` : ''}`} value={form.kkNumber} onChange={value => setField('kkNumber', value)} placeholder="16 digit" />
          </div>
          <p className="text-xs text-surface-500 flex items-center gap-2"><Shield size={13} /> Nomor KTP dan KK dienkripsi oleh server sebelum disimpan.</p>
        </Section>

        <Section icon={UsersRound} title="Data Keluarga">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Nama Ayah" value={form.fatherName} onChange={value => setField('fatherName', value)} placeholder="Nama ayah kandung" />
            <Input label="Nama Ibu" value={form.motherName} onChange={value => setField('motherName', value)} placeholder="Nama ibu kandung" />
          </div>
        </Section>

        <Section icon={IdCard} title="Kontak Darurat">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Nama Kontak Darurat" value={form.emergencyContactName} onChange={value => setField('emergencyContactName', value)} placeholder="Nama keluarga/kerabat" />
            <Input label="Nomor Darurat" value={form.emergencyContactPhone} onChange={value => setField('emergencyContactPhone', value)} placeholder="08123456789" />
          </div>
        </Section>

        <Section icon={BriefcaseBusiness} title="Pekerjaan, Pengalaman, dan Skill">
          <div className="space-y-4">
            {experiences.map((experience, index) => (
              <div key={index} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">Pengalaman Kerja {index + 1}</p>
                  <button type="button" onClick={() => removeExperience(index)} className="p-2 rounded-lg hover:bg-rose-500/10 text-surface-400 hover:text-rose-400">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Nama Perusahaan" value={experience.companyName} onChange={value => updateExperience(index, 'companyName', value)} placeholder="PT Contoh Teknologi" />
                  <Input label="Role Pekerjaan" value={experience.role} onChange={value => updateExperience(index, 'role', value)} placeholder="Frontend Developer" />
                  <Input type="date" label="Mulai Kerja" value={experience.startDate} onChange={value => updateExperience(index, 'startDate', value)} />
                  <div className="space-y-2">
                    <Input type="date" label="Selesai Kerja" value={experience.endDate} onChange={value => updateExperience(index, 'endDate', value)} disabled={experience.isPresent} />
                    <label className="flex items-center gap-2 text-xs text-surface-400">
                      <input type="checkbox" checked={experience.isPresent} onChange={e => updateExperience(index, 'isPresent', e.target.checked)} />
                      Masih bekerja / Present
                    </label>
                  </div>
                </div>
                <Textarea label="Detail Pekerjaan" rows={4} value={experience.detail} onChange={value => updateExperience(index, 'detail', value)} placeholder="Tuliskan tanggung jawab, pencapaian, dan teknologi yang digunakan" />
              </div>
            ))}
            <button type="button" onClick={addExperience} className="btn-ghost text-sm flex items-center gap-2">
              <Plus size={15} /> Tambah Pengalaman Kerja
            </button>
          </div>
          <Textarea label="Skill" rows={4} value={form.skill} onChange={value => setField('skill', value)} placeholder="Contoh: React, Express, PostgreSQL, Project Management" />
        </Section>

        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><FileText size={16} className="text-brand-400" /> Upload Dokumen</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" className="input-dark text-sm sm:w-56" placeholder="Label file *" value={documentLabel} onChange={e => setDocumentLabel(e.target.value)} />
            <label className="btn-ghost text-sm cursor-pointer flex items-center justify-center gap-2">
              {uploading === 'CV' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload CV PDF
              <input type="file" accept="application/pdf" className="hidden" onChange={e => uploadFile(e.target.files[0], 'CV')} />
            </label>
            <AppSelect className="sm:w-56" value={documentType} onChange={setDocumentType} options={documentTypes} />
            <label className="btn-ghost text-sm cursor-pointer flex items-center justify-center gap-2">
              {uploading === documentType ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload Dokumen
              <input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={e => uploadFile(e.target.files[0], documentType)} />
            </label>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {profile.documents?.length ? profile.documents.map(doc => (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white">{doc.label || doc.documentType}</p>
                  <p className="text-xs text-surface-400">{doc.storedFileName || doc.fileName}</p>
                  <p className="text-xs text-surface-500">{doc.documentType} - {formatDate(doc.uploadedAt || doc.createdAt)}</p>
                </div>
                <button type="button" onClick={() => downloadDocument(doc)} className="p-2 rounded-lg hover:bg-white/[0.08] text-surface-400 hover:text-brand-400">
                  <Download size={15} />
                </button>
              </div>
            )) : <p className="text-sm text-surface-500 py-3">Belum ada dokumen pendukung.</p>}
          </div>
        </div>

        <button type="submit" disabled={loading || !isDirty} className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Simpan Profil</>}
        </button>
      </form>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        tone={confirm?.tone}
        loading={loading}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const action = confirm?.onConfirm;
          setConfirm(null);
          await action?.();
        }}
      />
    </div>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="glass-card p-5 space-y-4">
    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
      <Icon size={16} className="text-brand-400" /> {title}
    </h3>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = 'text', placeholder = '', disabled = false }) => (
  <div>
    <label className="block text-xs text-surface-400 mb-1">{label}</label>
    <input type={type} disabled={disabled} className="input-dark text-sm disabled:opacity-50" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3, placeholder = '' }) => (
  <div>
    <label className="block text-xs text-surface-400 mb-1">{label}</label>
    <textarea className="input-dark text-sm resize-none" rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('id-ID') : '-';
}

function downloadBase64(fileData, fileName) {
  const link = document.createElement('a');
  link.href = fileData;
  link.download = fileName || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default MemberProfile;
