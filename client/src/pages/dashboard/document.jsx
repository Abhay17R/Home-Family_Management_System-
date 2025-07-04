// src/components/FileManager.jsx

import React, { useState, useEffect, useRef, memo } from 'react';
import { Folder, Plus, Upload, FileText, FileImage, File, Download, Trash2, X, Search, FileArchive, Loader2 } from 'lucide-react';
import axios from 'axios';
import '../../styles/Dashboard/document.css';
import API from '../../api/axios';


// ✅ STEP 1: Global Context se 'useAppFocus' hook import karein
import { useAppFocus } from '../../context/AppFocusContext';

// const API_URL = "http://localhost:4000/api/v1/documents";
const API_URL = import.meta.env.VITE_BACKEND_URL + '/api/v1/documents';

// Yeh aapke default folders ka "Master List" hai
const DEFAULT_FOLDERS = [
    { name: 'School Certificates', isDefault: true },
    { name: 'Government IDs', isDefault: true },
    { name: 'Medical Records', isDefault: true },
];

// ... (formatBytes aur getFileIcon helpers waise hi rahenge) ...
const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
const getFileIcon = (mimetype) => {
    if (!mimetype) return <File className="file-icon-type default" />;
    if (mimetype.includes('pdf')) return <FileText className="file-icon-type pdf" />;
    if (mimetype.includes('image')) return <FileImage className="file-icon-type image" />;
    if (mimetype.includes('zip') || mimetype.includes('x-rar-compressed')) return <FileArchive className="file-icon-type archive" />;
    return <File className="file-icon-type default" />;
};


const FileManager = () => {
    // States waise hi rahenge
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [fileToUpload, setFileToUpload] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // ✅ STEP 2: Context se 'blockFocusAction' function lein
    const { blockFocusAction } = useAppFocus();

    const fetchFolders = async () => {
        setLoadingFolders(true);
        setError('');
        try {
            const { data } = await API.get(`${API_URL}/folders`, { withCredentials: true });
            const dbFolders = data.folders;
            const dbFoldersMap = new Map(dbFolders.map(f => [f.name, f]));
            const orderedDefaultFolders = DEFAULT_FOLDERS.map(defaultFolder => dbFoldersMap.get(defaultFolder.name) || defaultFolder);
            const defaultFolderNames = new Set(DEFAULT_FOLDERS.map(df => df.name));
            const customFolders = dbFolders.filter(dbFolder => !defaultFolderNames.has(dbFolder.name));
            const finalFolders = [...orderedDefaultFolders, ...customFolders];
            setFolders(finalFolders);
            if (finalFolders.length > 0 && !selectedFolder) {
                setSelectedFolder(finalFolders[0]);
            }
        } catch (err) {
            setError('Could not fetch folders. Please try again later.');
            console.error(err);
        } finally {
            setLoadingFolders(false);
        }
    };
    
    const fetchFiles = async () => {
        if (!selectedFolder || (selectedFolder.isDefault && !selectedFolder._id)) {
            setFiles([]); setLoadingFiles(false); return;
        }
        setLoadingFiles(true); setError('');
        try {
            const { data } = await API.get(`${API_URL}/files/${selectedFolder._id}?search=${searchTerm}`, { withCredentials: true });
            setFiles(data.files);
        } catch (err) {
            setError('Could not fetch files.'); console.error(err);
        } finally { setLoadingFiles(false); }
    };

    // Sirf initial load par folders fetch karein. Focus ka kaam ab DashboardLayout karega.
    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (selectedFolder) {
            fetchFiles();
        }
    }, [selectedFolder, searchTerm]);
    
    // ... baaki ke functions (openModal, etc.) waise hi rahenge ...
    const openModal = (type) => { setModalType(type); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setNewFolderName(''); setFileToUpload(null); if (fileInputRef.current) fileInputRef.current.value = null; };
    const handleCreateFolder = async (e) => {
        e.preventDefault(); if (newFolderName.trim() === '') return;
        try {
            const { data: { folder: newFolder } } = await API.post(`${API_URL}/folders`, { name: newFolderName }, { withCredentials: true });
            closeModal(); await fetchFolders(); setSelectedFolder(newFolder);
        } catch (err) { alert('Error creating folder: ' + (err.response?.data?.message || 'Server error')); }
    };
    const handleDeleteFolder = async (folderId, folderName) => {
        if (!window.confirm(`Are you sure you want to delete "${folderName}"? ALL files will be deleted.`)) return;
        try {
            await API.delete(`${API_URL}/folders/${folderId}`, { withCredentials: true });
            setSelectedFolder(null); fetchFolders();
            
        } catch (err) { alert('Could not delete folder: ' + (err.response?.data?.message || 'Server error')); }
    };
    const handleOpenUploadModal = async () => {
        if (!selectedFolder) return;
        if (selectedFolder.isDefault && !selectedFolder._id) {
            try {
                const { data } = await API.post(`${API_URL}/folders`, { name: selectedFolder.name }, { withCredentials: true });
                const newDbFolder = data.folder;
                setSelectedFolder(newDbFolder); setFolders(currentFolders => currentFolders.map(f => f.name === newDbFolder.name ? newDbFolder : f));
                openModal('upload');
            } catch (err) { alert('Could not prepare folder for upload.'); console.error(err); }
        } else { openModal('upload'); }
    };
    const handleFileSelect = (e) => { const file = e.target.files[0]; if (file) setFileToUpload(file); };
    const handleUploadFile = async () => {
        if (!fileToUpload || !selectedFolder || !selectedFolder._id) { alert('Please select a file and a valid folder.'); return; }
        const formData = new FormData(); formData.append('file', fileToUpload);
        setUploading(true);
        try {
            await API.post(`${API_URL}/files/${selectedFolder._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true, });
            closeModal(); await fetchFiles();
        } catch (err) { alert('Upload failed: ' + (err.response?.data?.message || 'Server error')); } finally { setUploading(false); }
    };
    const handleDeleteFile = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await API.delete(`${API_URL}/files/${fileId}`, { withCredentials: true });
            setFiles(prevFiles => prevFiles.filter(f => f._id !== fileId));
        } catch (err) { alert('Could not delete file: ' + (err.response?.data?.message || 'Server error')); }
    };
    
    return (
        <div className="doc-container">
            <header className="doc-header">
                <div><h1>Documents & Certificates</h1><p>Manage and organize your family's important documents securely.</p></div>
                <button className="doc-button primary" onClick={() => openModal('create')}><Plus size={18} /> Create Folder</button>
            </header>
            <div className="doc-main-layout">
                <aside className="doc-sidebar">
                    <h2 className="doc-sidebar-title">Folders</h2>
                    <nav className="doc-folder-list">
                        {loadingFolders ? <p>Loading folders...</p> : folders.map(folder => (
                            <div key={folder._id || folder.name} className={`doc-folder-item ${selectedFolder?._id ? selectedFolder._id === folder._id : selectedFolder?.name === folder.name ? 'active' : ''}`}>
                                <a href="#" className="folder-name-link" onClick={(e) => { e.preventDefault(); setSelectedFolder(folder); }}><Folder size={20} /><span>{folder.name}</span></a>
                                {!folder.isDefault && (<button className="icon-button danger folder-delete-btn" title={`Delete ${folder.name}`} onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder._id, folder.name); }}><Trash2 size={16} /></button>)}
                            </div>
                        ))}
                    </nav>
                </aside>
                <main className="doc-file-display">
                    <div className="doc-file-header">
                        <div className="search-wrapper"><Search size={20} className="search-icon" /><input type="text" placeholder={`Search in ${selectedFolder?.name || '...'} `} className="search-input" onChange={(e) => setSearchTerm(e.target.value)} disabled={!selectedFolder}/></div>
                        <button className="doc-button secondary" onClick={handleOpenUploadModal} disabled={!selectedFolder}><Upload size={18} /> Upload File</button>
                    </div>
                    <div className="doc-file-list">
                        {loadingFiles ? (<div className="empty-state"><Loader2 className="animate-spin" size={48} /> <p>Loading files...</p></div>) : files.length > 0 ? (files.map(file => (
                            <div key={file._id} className="doc-file-row"><div className="file-info"><div className="file-icon-wrapper">{getFileIcon(file.mimetype)}</div><div><div className="file-name">{file.name}</div><div className="file-meta">{new Date(file.createdAt).toLocaleDateString()} • {formatBytes(file.size)}</div></div></div><div className="file-actions"><a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name} className="icon-button"><Download size={20} /></a><button className="icon-button danger" onClick={() => handleDeleteFile(file._id)}><Trash2 size={20} /></button></div></div>
                        ))) : (<div className="empty-state"><FileText size={48} /><h3>{searchTerm ? 'No files match your search' : 'This folder is empty'}</h3><p>{searchTerm ? 'Try a different search term.' : 'Upload a document to get started.'}</p></div>)}
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </main>
            </div>
            {isModalOpen && (<div className="doc-modal-backdrop" onClick={closeModal}>
                <div className="doc-modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close-button" onClick={closeModal}><X size={24} /></button>
                    {modalType === 'create' && (<form onSubmit={handleCreateFolder}><h2>Create New Folder</h2><p>Organize your documents by creating a new folder.</p><input type="text" className="doc-input" placeholder="e.g., Bank Statements" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} autoFocus /><button type="submit" className="doc-button primary full-width">Create Folder</button></form>)}
                    {modalType === 'upload' && (<>
                        <h2>Upload to "{selectedFolder?.name}"</h2><p>Select a file from your computer to upload.</p>
                        
                        {/* ✅ STEP 3: onClick MEIN GLOBAL STATE KO BLOCK KAREIN */}
                        <div className="upload-area" onClick={() => {
                            // File dialog khulne se theek pehle, global focus action ko block kar do
                            blockFocusAction();
                            fileInputRef.current?.click();
                        }}>
                            <Upload size={48} color="#94a3b8" /><p>{fileToUpload ? fileToUpload.name : 'Click to browse files'}</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
                        </div>
                        <button className="doc-button primary full-width" onClick={handleUploadFile} disabled={!fileToUpload || uploading}>{uploading ? <Loader2 className="animate-spin" /> : 'Upload Now'}</button>
                    </>)}
                </div>
            </div>)}
        </div>
    );
};

export default memo(FileManager);