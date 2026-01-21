"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import { toast } from "sonner"

interface AddItemModalProps {
  open: boolean
  onClose: () => void
  onAddItem: (item: any) => void
  defaultLocation?: string
}

export function AddItemModal({
  open,
  onClose,
  onAddItem,
  defaultLocation = ""
}: AddItemModalProps) {
  const [itemName, setItemName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [location, setLocation] = React.useState(defaultLocation)
  const [measurements, setMeasurements] = React.useState({ size: "", unit: "" })
  const [image, setImage] = React.useState<string | null>(null)
  const [showCamera, setShowCamera] = React.useState(false)
  const [cameraActive, setCameraActive] = React.useState(false)
  const [cameraError, setCameraError] = React.useState<string | null>(null)

  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)

  React.useEffect(() => {
    setLocation(defaultLocation)
  }, [defaultLocation])

  React.useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setItemName("")
      setDescription("")
      setMeasurements({ size: "", unit: "" })
      setImage(null)
      setShowCamera(false)
      setCameraActive(false)
      setCameraError(null)
      stopCamera()
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemName.trim()) {
      toast.error("Item name is required")
      return
    }

    const itemData = {
      itemName: itemName.trim(),
      description: description.trim() || undefined,
      itemLocation: { path: location || "/" },
      itemMeasurements: measurements.size && measurements.unit ? {
        size: parseFloat(measurements.size) || 0,
        unit: measurements.unit
      } : undefined,
      image: image || undefined
    }

    onAddItem(itemData)
    onClose()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.match('image.*')) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please select an image under 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      toast.success("Image uploaded successfully")
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const startCamera = async () => {
    try {
      setCameraError(null)
      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("Unable to access camera. Please check permissions.")
      toast.error("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = canvas.toDataURL('image/jpeg', 0.9)

    setImage(imageData)
    setShowCamera(false)
    stopCamera()
    toast.success("Photo captured successfully")
  }

  const removeImage = () => {
    setImage(null)
    toast.success("Image removed")
  }

  const handleCameraClose = () => {
    setShowCamera(false)
    stopCamera()
  }

  return (
    <>
      <Dialog open={open && !showCamera} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemName" className="text-right">
                  Name *
                </Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter item description (optional)"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Measurements
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    value={measurements.size}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="Size"
                    className="flex-1"
                  />
                  <Input
                    value={measurements.unit}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="Unit (ft, lbs, pcs, etc.)"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter location path"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Photo
                </Label>
                <div className="col-span-3">
                  {image ? (
                    <Card>
                      <CardContent className="p-4">
                        <div className="relative">
                          <img
                            src={image}
                            alt="Item preview"
                            className="w-full max-h-48 object-contain rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowCamera(true)
                              setTimeout(() => startCamera(), 300)
                            }}
                            className="h-20 flex flex-col gap-2"
                          >
                            <Camera className="h-6 w-6" />
                            <span className="text-xs">Take Photo</span>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-20 flex flex-col gap-2"
                          >
                            <Upload className="h-6 w-6" />
                            <span className="text-xs">Upload Image</span>
                          </Button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showCamera && (
        <Dialog open={showCamera} onOpenChange={handleCameraClose}>
          <DialogContent className="sm:max-w-md modal-box bg-base-100">
            <DialogHeader>
              <DialogTitle>Take a Photo</DialogTitle>
              <DialogDescription>
                Capture a photo of the item
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-48 object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {!cameraActive && !cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <div className="text-center text-white">
                          <Camera className="h-8 w-8 mx-auto mb-2 opacity-80" />
                          <p className="text-sm">Accessing camera...</p>
                        </div>
                      </div>
                    )}
                    {cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <div className="text-center text-white">
                          <p className="text-red-400 text-sm font-medium">{cameraError}</p>
                          <p className="text-xs mt-1">Please check your camera permissions</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={handleCameraClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1"
                  disabled={!cameraActive}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}