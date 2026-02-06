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
import { Item } from "@/lib/types"
import { toast } from "sonner"
import { getPlaceholderImage } from "@/lib/utils"

interface ItemDetailsModalProps {
  open: boolean
  onClose: () => void
  item: Item | null
  onEdit: (item: Item) => void
  onAddItem: (item: Partial<Item>) => void
  onDelete?: (itemId: string) => void
}

export function ItemDetailsModal({
  open,
  onClose,
  item,
  onEdit,
  onAddItem,
  onDelete
}: ItemDetailsModalProps) {
  // ... (existing state) ...
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedItem, setEditedItem] = React.useState<Partial<Item>>({})
  const [editedMeasurements, setEditedMeasurements] = React.useState({ size: "", unit: "" })
  const [image, setImage] = React.useState<string | null>(null)
  const [showCamera, setShowCamera] = React.useState(false)
  const [cameraActive, setCameraActive] = React.useState(false)
  const [cameraError, setCameraError] = React.useState<string | null>(null)

  // ... (existing refs and effects) ...
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)

  React.useEffect(() => {
    if (item) {
      setEditedItem({
        itemName: item.itemName,
        itemLocation: item.itemLocation,
        description: item.description,
        itemMeasurements: item.itemMeasurements
      })
      setImage(item.image || null)
      if (item.itemMeasurements) {
        setEditedMeasurements({
          size: item.itemMeasurements.size.toString(),
          unit: item.itemMeasurements.unit
        })
      } else {
        setEditedMeasurements({ size: "", unit: "" })
      }
      setIsEditing(false)
    }
  }, [item])

  React.useEffect(() => {
    if (!open) {
      setIsEditing(false)
      setShowCamera(false)
      setCameraActive(false)
      setCameraError(null)
      stopCamera()
    }
  }, [open])

  // ... (handlers) ...
  const handleSave = () => {
    if (item && editedItem) {
      const updatedItem: Item = {
        id: item.id,
        itemName: editedItem.itemName || item.itemName,
        itemLocation: item.itemLocation,
        description: editedItem.description !== undefined ? editedItem.description : item.description,
        image: image !== null ? image : (image === null && item.image ? undefined : item.image),
        itemMeasurements: editedMeasurements.size && editedMeasurements.unit ? {
          size: parseFloat(editedMeasurements.size) || 0,
          unit: editedMeasurements.unit
        } : (editedMeasurements.size === "" && editedMeasurements.unit === "" ? undefined : item.itemMeasurements)
      }
      onEdit(updatedItem)
      setIsEditing(false)
      onClose()
    }
  }

  const handleAddSimilar = () => {
    if (item) {
      onAddItem({
        itemName: `${item.itemName} (Copy)`,
        itemLocation: item.itemLocation,
        description: item.description,
        itemMeasurements: item.itemMeasurements,
        image: item.image
      })
    }
  }

  const handleDelete = () => {
    if (item && onDelete) {
      if (confirm("Are you sure you want to delete this item?")) {
        onDelete(item.id)
        onClose()
      }
    }
  }

  // ... (image handlers) ...
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

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = event.currentTarget
    imgElement.src = getPlaceholderImage('item', item?.itemName || 'Item')
  }

  if (!item) return null

  return (
    <>
      <Dialog open={open && !showCamera} onOpenChange={onClose}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-300 bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Edit ${item.itemName}` : `${item.itemName} Details`}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Make changes to the item details." : "View item information."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {isEditing ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="itemName" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="itemName"
                    value={editedItem.itemName || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, itemName: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={editedItem.description || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editedMeasurements.size}
                      onChange={(e) => setEditedMeasurements(prev => ({
                        ...prev,
                        size: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={editedMeasurements.unit}
                      onChange={(e) => setEditedMeasurements(prev => ({
                        ...prev,
                        unit: e.target.value
                      }))}
                      placeholder="pcs, ft, lbs, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Photo
                  </Label>
                  <div className="col-span-3">
                    {image ? (
                      <Card className="bg-background border-border">
                        <CardContent className="p-4 bg-background">
                          <div className="relative">
                            <img
                              src={image}
                              alt="Item preview"
                              className="w-full max-h-48 object-contain rounded bg-background"
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
                      <Card className="bg-background border-border">
                        <CardContent className="p-4 bg-background">
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowCamera(true)
                                setTimeout(() => startCamera(), 300)
                              }}
                              className="h-20 flex flex-col gap-2 bg-background"
                            >
                              <Camera className="h-6 w-6" />
                              <span className="text-xs">Take Photo</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="h-20 flex flex-col gap-2 bg-background"
                            >
                              <Upload className="h-6 w-6" />
                              <span className="text-xs">Upload</span>
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
              </>
            ) : (
              <div className="space-y-4">
                <Card className="overflow-hidden animate-in fade-in zoom-in-95 duration-300 border-0 bg-background">
                  <CardContent className="p-0 bg-background">
                    <img
                      src={item.image || getPlaceholderImage('item', item.itemName)}
                      alt={item.itemName}
                      className="w-full max-h-48 sm:max-h-64 object-contain bg-background"
                      onError={handleImageError}
                    />
                  </CardContent>
                </Card>

                <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col py-2 border-b border-border/50 gap-1">
                    <span className="font-medium">Name:</span>
                    <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{item.itemName}</span>
                  </div>

                  <div className="flex flex-col py-2 border-b border-border/50 gap-1">
                    <span className="font-medium">Location:</span>
                    <span className="text-sm text-muted-foreground" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                      {item.itemLocation.path.split('/').filter(Boolean).map((segment, index, arr) => (
                        <span key={index}>
                          /{segment}
                          {index < arr.length - 1 && <wbr />}
                        </span>
                      ))}
                    </span>
                  </div>

                  {item.itemMeasurements && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="font-medium">Measurements:</span>
                      <span className="text-right">{item.itemMeasurements.size} {item.itemMeasurements.unit}</span>
                    </div>
                  )}

                  {item.description && (
                    <div className="py-2 border-b border-border/50">
                      <span className="font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleAddSimilar}>
                  Add Similar
                </Button>
                {!isEditing && onDelete && (
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={onClose}>
                      Close
                    </Button>
                    <Button onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCamera && (
        <Dialog open={showCamera} onOpenChange={handleCameraClose}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6 modal-box bg-background">
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