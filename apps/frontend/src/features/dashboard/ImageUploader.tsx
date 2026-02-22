import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '../../components/Button';
import heic2any from 'heic2any';
import { Upload, X } from 'lucide-react';

// A utility to get cropped image
const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        if (url.startsWith('http')) {
            image.setAttribute('crossOrigin', 'anonymous')
        }
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => {
            console.error('Error loading image', error);
            reject(error);
        })
        image.src = url
    })

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: any
): Promise<string> {
    try {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return ''

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve, reject) => {
            try {
                // 0.8 quality jpeg to save size, since base64 can be larger
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            } catch (err) {
                console.error("Canvas toDataUrl failed", err);
                reject(err);
            }
        });
    } catch (e) {
        console.error("getCroppedImg failed", e);
        throw e;
    }
}

interface ImageUploaderProps {
    onSave: (base64Url: string) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ImageUploader = ({ onSave, onCancel, isLoading = false }: ImageUploaderProps) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [originalUrl, setOriginalUrl] = useState('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            if (!imageSrc || !croppedAreaPixels) {
                if (originalUrl) {
                    onSave(originalUrl);
                }
                return;
            }
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onSave(croppedImage);
        } catch (e) {
            console.error('showCroppedImage error:', e);
            if (originalUrl && imageSrc === originalUrl) {
                onSave(originalUrl); // Fallback se il CORS blocca il canvas
            }
        }
    }, [imageSrc, croppedAreaPixels, onSave, originalUrl]);

    const processFile = async (file: File) => {
        // Handle HEIC
        if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                }) as Blob;
                file = new File([convertedBlob], "converted.jpg", { type: "image/jpeg" });
            } catch (e) {
                console.error("Heic conversion error", e);
            }
        }

        let imageDataUrl = await readFile(file);
        setImageSrc(imageDataUrl);
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await processFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFile(e.dataTransfer.files[0]);
        }
    };

    const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOriginalUrl(e.target.value);
    }

    return (
        <div style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Modifica Immagine Profilo</h3>
                <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                    <X size={20} />
                </button>
            </div>

            {!imageSrc ? (
                <>
                    <label
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '48px 32px', border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '12px', cursor: 'pointer', marginBottom: '24px', backgroundColor: isDragging ? 'rgba(var(--color-primary-rgb), 0.05)' : 'var(--color-bg)' }}
                    >
                        <Upload size={32} color={isDragging ? "var(--color-primary)" : "var(--color-text-secondary)"} />
                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>Carica dal dispositivo o trascina qui</span>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>File JPG, PNG o HEIC</span>
                        <input type="file" accept="image/jpeg, image/png, image/heic, .jpeg, .jpg, .png, .heic, image/*" onChange={onFileChange} style={{ display: 'none' }} />
                    </label>

                    <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '24px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--color-border)' }}></div>
                        <span style={{ background: 'var(--color-surface)', padding: '0 12px', position: 'relative' }}>OPPURE</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Incolla solo URL (es: https://...)"
                            value={originalUrl}
                            onChange={handleUrlPaste}
                            style={{ flex: '1 1 min-content', minWidth: '150px', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '15px' }}
                        />
                        <Button type="button" onClick={() => setImageSrc(originalUrl)} disabled={!originalUrl} style={{ whiteSpace: 'nowrap' }}>Carica URL</Button>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ position: 'relative', width: '100%', height: '350px', backgroundColor: 'var(--color-bg)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{ flex: 1, cursor: 'pointer' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                        <Button type="button" variant="secondary" onClick={() => setImageSrc(null)} disabled={isLoading} style={{ whiteSpace: 'nowrap' }}>Indietro</Button>
                        <Button type="button" onClick={showCroppedImage} isLoading={isLoading} style={{ whiteSpace: 'nowrap' }}>Conferma Taglio</Button>
                    </div>
                </>
            )}
        </div>
    );
};

function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result as string), false);
        reader.readAsDataURL(file);
    });
}
