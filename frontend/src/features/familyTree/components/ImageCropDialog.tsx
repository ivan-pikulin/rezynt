import React, { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Slider, IconButton } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import Cropper from 'react-easy-crop';
import { useTranslation } from 'react-i18next';

interface Point { x: number; y: number }
interface Area { width: number; height: number; x: number; y: number }

interface ImageCropDialogProps {
  open: boolean;
  image: string;
  onClose: () => void;
  onSave: (croppedImage: Blob) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation: number): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Установим размер холста равным размеру кропа
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Рисуем круглый кроп
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    Math.min(canvas.width, canvas.height) / 2,
    0,
    2 * Math.PI
  );
  ctx.clip();

  // Применяем поворот
  if (rotation !== 0) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  // Рисуем изображение
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

  // Конвертируем canvas в blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg');
  });
}

export const ImageCropDialog: React.FC<ImageCropDialogProps> = ({ open, image, onClose, onSave }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Сбрасываем настройки при изменении изображения
  React.useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  }, [image]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
        onSave(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, image, onSave, rotation]);

  const handleRotate = (delta: number) => {
    setRotation((prev) => (prev + delta + 360) % 360);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      classes={{ paper: 'image-crop-dialog' }}
    >
      <DialogTitle className="image-crop-title">{t('dialog.crop.title')}</DialogTitle>
      <DialogContent className="image-crop-content">
        <Box className="image-crop-container">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </Box>

        <Box className="image-crop-tools">
          <Box className="image-crop-zoom-controls">
            <IconButton 
              onClick={() => setZoom(z => Math.max(1, z - 0.1))}
              size="small"
              className="image-crop-tool"
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(_, value) => setZoom(value as number)}
              className="image-crop-slider"
            />
            
            <IconButton 
              onClick={() => setZoom(z => Math.min(3, z + 0.1))}
              size="small"
              className="image-crop-tool"
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box className="image-crop-rotate-controls">
            <IconButton 
              onClick={() => handleRotate(-90)}
              size="small"
              className="image-crop-tool"
            >
              <RotateLeftIcon fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={() => handleRotate(90)}
              size="small"
              className="image-crop-tool"
            >
              <RotateRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="image-crop-actions">
        <Button 
          onClick={onClose}
          size="small"
          color="inherit"
        >
          {t('dialog.crop.cancel')}
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          size="small"
        >
          {t('dialog.crop.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 