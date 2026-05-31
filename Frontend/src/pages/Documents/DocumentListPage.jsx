import { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import DocumentCard from '../../components/documents/DocumentCard'
import EmptyState from '../../components/common/EmptyState';

const DocumentListPage = () => {

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for upload modal
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploading, setUploading] = useState(false);

    // State for delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const fetchDocuments = async () => {
        try {
            const data = await documentService.getDocuments();
            setDocuments(data);
        } catch (error) {
            toast.error("Failed to fetch documents.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Only PDF allowed
        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            return;
        }

        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Please upload PDF under 10MB");
            return;
        }

        setUploadFile(file);
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadTitle) {
            toast.error("Please provide a title and select a file.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("title", uploadTitle);

        try {
            await documentService.uploadDocument(formData);
            toast.success("Document uploaded successfully!");
            setIsUploadModalOpen(false);
            setUploadFile(null);
            setUploadTitle("");
            setLoading(true);
            fetchDocuments();
        } catch (error) {
            toast.error(error.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteRequest = (doc) => {
        setSelectedDoc(doc);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDoc) return;
        setDeleting(true);
        try {
            await documentService.deleteDocument(selectedDoc._id);
            toast.success(`'${selectedDoc.title}' deleted.`);
            setIsDeleteModalOpen(false);
            setSelectedDoc(null);
            setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
        } catch (error) {
            toast.error(error.message || "Failed to delete document.");
        } finally {
            setDeleting(false);
        }
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className='flex items-center justify-center min-h-[300px] sm:min-h-[400px]'>
                    <Spinner />
                </div>
            );
        }

        if (documents.length === 0) {
            return (
                <EmptyState 
                    onActionClick={() => setIsUploadModalOpen(true)}
                    title="No Documents Yet"
                    description="Get started by uploading your first PDF document to begin learning"
                    buttonText="Upload Document"
                />
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {documents?.map((doc) => (
                    <DocumentCard
                        key={doc._id}
                        document={doc}
                        onDelete={handleDeleteRequest}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className='min-h-screen w-full'>
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [bg-size:16px_16px] opacity-30 pointer-events-none" />

            <div className='relative w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6'>
                {/* Header */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-10 gap-3'>
                    <div>
                        <h1 className='text-xl sm:text-2xl font-medium text-slate-900 tracking-tight mb-1 sm:mb-2'>
                            My Documents
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm">
                            Manage and organize your learning materials
                        </p>
                    </div>
                    {/* ✅ FIXED: Always visible, properly aligned right */}
                    <div className="flex justify-start sm:justify-end">
                        <Button 
                            onClick={() => setIsUploadModalOpen(true)} 
                            size="sm" 
                            className="text-xs sm:text-sm inline-flex items-center gap-2"
                        >
                            <Plus className='w-3.5 h-3.5 sm:w-4 sm:h-4' strokeWidth={2.5} />
                            <span className="hidden sm:inline">Upload Document</span>
                            <span className="sm:hidden">Upload</span>
                        </Button>
                    </div>
                </div>

                {renderContent()}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-xl sm:rounded-2xl shadow-2xl shadow-slate-900/20 p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsUploadModalOpen(false)}
                            className='absolute top-3 right-3 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200'
                        >
                            <X className='w-5 h-5' strokeWidth={2} />
                        </button>

                        {/* Modal Header */}
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-medium text-slate-900 tracking-tight">
                                Upload New Document
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Add a PDF document to your library
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleUpload} className="space-y-4 sm:space-y-5">
                            {/* Title Input */}
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Document Title
                                </label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    required
                                    className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 border-slate-200 rounded-lg sm:rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                    placeholder='e.g., React Interview Prep'
                                />
                            </div>

                            {/* File Upload */}
                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    PDF File
                                </label>
                                <div className="relative border-2 border-dashed border-slate-300 rounded-lg sm:rounded-xl bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200">
                                    <input
                                        id='file-upload'
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept='.pdf'
                                    />

                                    <div className="flex flex-col items-center justify-center py-6 sm:py-10 px-4 sm:px-6">
                                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-linear-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                                            <Upload className='w-5 h-5 sm:w-7 sm:h-7 text-emerald-600' strokeWidth={2} />
                                        </div>
                                        <p className="text-xs sm:text-sm font-medium text-slate-700 mt-2 mb-1 text-center">
                                            {uploadFile ? (
                                                <span className="text-emerald-600 wrap-break-word">
                                                    {uploadFile.name}
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="text-emerald-600">
                                                        Click to upload
                                                    </span>{" "}
                                                    or drag and drop
                                                </>
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            PDF up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex gap-2 sm:gap-3 pt-2">
                                <button
                                    type='button'
                                    onClick={() => setIsUploadModalOpen(false)}
                                    disabled={uploading}
                                    className='flex-1 h-10 sm:h-11 px-3 sm:px-4 border-2 border-slate-200 rounded-lg sm:rounded-xl bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={uploading}
                                    className='flex-1 h-10 sm:h-11 px-3 sm:px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span className="hidden sm:inline">Uploading...</span>
                                            <span className="sm:hidden">Uploading</span>
                                        </span>
                                    ) : (
                                        "Upload"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-xl sm:rounded-2xl shadow-2xl shadow-slate-900/20 p-5 sm:p-8">
                        {/* Close Button */}
                        <button
                            className="absolute top-3 right-3 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            <X className='w-5 h-5' strokeWidth={2} />
                        </button>

                        {/* Modal Header */}
                        <div className="mb-4 sm:mb-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-r from-red-100 to-red-200 flex items-center justify-center mb-3 sm:mb-4">
                                <Trash2 className='w-5 h-5 sm:w-6 sm:h-6 text-red-600' strokeWidth={2} />
                            </div>
                            <h2 className="text-lg sm:text-xl font-medium text-slate-900 tracking-tight">
                                Confirm Deletion
                            </h2>
                        </div>

                        {/* Content */}
                        <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
                            Are you sure you want to delete the document:{" "}
                            <span className="font-semibold text-slate-900 wrap-break-word">
                                {selectedDoc?.title}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:gap-3">
                            <button
                                className="flex-1 h-10 sm:h-11 px-3 sm:px-4 border-2 border-slate-200 rounded-lg sm:rounded-xl bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                type='button'
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className='flex-1 h-10 sm:h-11 px-3 sm:px-4 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
                                disabled={deleting}
                                onClick={handleConfirmDelete}
                            >
                                {deleting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="hidden sm:inline">Deleting...</span>
                                        <span className="sm:hidden">Deleting</span>
                                    </span>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DocumentListPage