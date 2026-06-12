"use client";

import { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ImagePlus, Loader2, X, UploadCloud, Crop as CropIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, label = "Upload Image", disabled }: ImageUploadProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result as string);
                setIsOpen(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return null;
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

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
        );

        return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                resolve(blob);
            }, "image/jpeg");
        });
    };

    const handleUpload = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            setLoading(true);
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            if (!croppedBlob) throw new Error("Could not crop image");

            const formData = new FormData();
            formData.append("file", croppedBlob, "logo.jpg");

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            onChange(data.url);
            setIsOpen(false);
            setImageSrc(null);
            toast.success("Image uploaded successfully");

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative group w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            onClick={() => onChange("")}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            type="button"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => !disabled && fileInputRef.current?.click()}
                        className={`w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-blue hover:bg-blue-50/50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ImagePlus className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Upload</span>
                    </div>
                )}

                <div className="flex-1">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        disabled={disabled}
                    />
                    {!value && (
                        <div className="text-sm text-gray-500">
                            <p className="font-medium text-gray-700 mb-1">{label}</p>
                            <p className="text-xs">Supported formats: JPG, PNG. Max size: 5MB.</p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                    </DialogHeader>

                    <div className="relative h-[300px] w-full bg-black rounded-lg overflow-hidden mt-4">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Square aspect ratio for logos
                                onCropChange={setCrop}
                                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>

                    <div className="py-4 space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <CropIcon className="w-4 h-4" />
                            Zoom
                        </label>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value: number[]) => setZoom(value[0])}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={loading} className="bg-brand-blue text-white hover:bg-blue-700">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-4 h-4 mr-2" />
                                    Crop & Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
