import React, { useState } from 'react';
import { Folder, Plus, Upload, FileText, FileImage, File, Download, Trash2, X, MoreVertical, Search, FileArchive } from 'lucide-react';
import '../../styles/Dashboard/document.css';

// --- Mock Data (Ise aap API se fetch karenge) ---
const initialFolders = [
    {
        id: 1,
        name: 'School Certificates',
        files: [
            { id: 101, name: '10th_Marksheet.pdf', type: 'pdf', date: '22 Oct 2023', size: '1.2 MB' },
            { id: 102, name: 'Graduation_Degree.pdf', type: 'pdf', date: '21 Oct 2023', size: '2.5 MB' },
            { id: 103, name: 'Profile_Photo.jpg', type: 'jpg', date: '15 Oct 2023', size: '800 KB' },
        ],
    },
    {
        id: 2,
        name: 'Government IDs',
        files: [
            { id: 201, name: 'Aadhaar_Card_Scan.pdf', type: 'pdf', date: '15 Sep 2023', size: '950 KB' },
            { id: 202, name: 'PAN_Card.png', type: 'png', date: '11 Sep 2023', size: '600 KB' },
        ],
    },
    {
        id: 3,
        name: 'Medical Records',
        files: [],
    },
];

// Helper to get file icon
const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
        case 'pdf': return <FileText className="file-icon-type pdf" />;
        case 'jpg': case 'jpeg': case 'png': return <FileImage className="file-icon-type image" />;
        case 'zip': case 'rar': return <FileArchive className="file-icon-type archive" />;
        default: return <File className="file-icon-type default" />;
    }
};

const FileManager = () => {
    const [folders, setFolders] = useState(initialFolders);
    const [selectedFolderId, setSelectedFolderId] = useState(1);
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'create' or 'upload'
    const [newFolderName, setNewFolderName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const activeFolder = folders.find(f => f.id === selectedFolderId);
    
    const filteredFiles = activeFolder?.files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const openModal = (type) => {
        setModalType(type);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setNewFolderName('');
    };

    const handleCreateFolder = (e) => {
        e.preventDefault();
        if (newFolderName.trim() === '') return;
        // API Call: POST /api/folders
        const newFolder = { id: Date.now(), name: newFolderName, files: [] };
        setFolders([...folders, newFolder]);
        closeModal();
    };

    const handleDeleteFile = (fileId) => {
        // API Call: DELETE /api/files/{fileId}
        const updatedFolders = folders.map(f => {
            if (f.id === selectedFolderId) {
                return { ...f, files: f.files.filter(file => file.id !== fileId) };
            }
            return f;
        });
        setFolders(updatedFolders);
    };

    return (
        <div className="doc-container">
            {/* --- Header --- */}
            <header className="doc-header">
                <div>
                    <h1>Documents & Certificates</h1>
                    <p>Manage and organize your family's important documents securely.</p>
                </div>
                <button className="doc-button primary" onClick={() => openModal('create')}>
                    <Plus size={18} /> Create Folder
                </button>
            </header>

            {/* --- Main Layout --- */}
            <div className="doc-main-layout">
                {/* Folder List */}
                <aside className="doc-sidebar">
                    <h2 className="doc-sidebar-title">Folders</h2>
                    <nav className="doc-folder-list">
                        {folders.map(folder => (
                            <a
                                key={folder.id}
                                href="#"
                                className={`doc-folder-item ${folder.id === selectedFolderId ? 'active' : ''}`}
                                onClick={(e) => { e.preventDefault(); setSelectedFolderId(folder.id); }}
                            >
                                <Folder size={20} />
                                <span>{folder.name}</span>
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* File Display */}
                <main className="doc-file-display">
                    <div className="doc-file-header">
                        <div className="search-wrapper">
                            <Search size={20} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search in this folder..." 
                                className="search-input"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="doc-button secondary" onClick={() => openModal('upload')}>
                            <Upload size={18} /> Upload File
                        </button>
                    </div>

                    <div className="doc-file-list">
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map(file => (
                                <div key={file.id} className="doc-file-row">
                                    <div className="file-info">
                                        <div className="file-icon-wrapper">{getFileIcon(file.type)}</div>
                                        <div>
                                            <div className="file-name">{file.name}</div>
                                            <div className="file-meta">{file.date} • {file.size}</div>
                                        </div>
                                    </div>
                                    <div className="file-actions">
                                        <button className="icon-button"><Download size={20} /></button>
                                        <button className="icon-button danger" onClick={() => handleDeleteFile(file.id)}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <FileText size={48} />
                                <h3>{activeFolder?.files.length > 0 ? 'No files match your search' : 'This folder is empty'}</h3>
                                <p>{activeFolder?.files.length > 0 ? 'Try searching for something else.' : 'Upload a document to get started.'}</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* --- Modals --- */}
            {isModalOpen && (
                <div className="doc-modal-backdrop" onClick={closeModal}>
                    <div className="doc-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={closeModal}><X size={24} /></button>
                        {modalType === 'create' && (
                            <>
                                <h2>Create New Folder</h2>
                                <p>Organize your documents by creating a new folder.</p>
                                <form onSubmit={handleCreateFolder}>
                                    <input
                                        type="text"
                                        className="doc-input"
                                        placeholder="e.g., Bank Statements"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        autoFocus
                                    />
                                    <button type="submit" className="doc-button primary full-width">Create Folder</button>
                                </form>
                            </>
                        )}
                        {modalType === 'upload' && (
                             <>
                                <h2>Upload to "{activeFolder?.name}"</h2>
                                <p>You can drag and drop files or browse your computer.</p>
                                <div className="upload-area">
                                   <Upload size={48} color="#94a3b8"/>
                                   <p>Drag & drop files here</p>
                                   <span>or</span>
                                   <button className="doc-button secondary">Browse Files</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileManager;