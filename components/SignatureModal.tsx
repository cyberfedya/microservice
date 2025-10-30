import React, { useState, useRef, useEffect } from 'react';
import { Modal, Tabs, Button, Upload, message } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface Point {
  x: number;
  y: number;
  time: number;
}

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (signatureData: string) => void;
  documentTitle?: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  visible,
  onClose,
  onSubmit,
  documentTitle = 'Hujjat'
}) => {
  const [activeTab, setActiveTab] = useState<string>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [allStrokes, setAllStrokes] = useState<Array<Point[]>>([]);

  // Инициализация canvas
  useEffect(() => {
    if (canvasRef.current && visible) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        setCtx(context);
        // Очищаем canvas при открытии
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [visible]);

  // Перерисовка всех штрихов
  const redrawCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    allStrokes.forEach(stroke => {
      drawSmoothStroke(stroke);
    });
  };

  // Функция для вычисления расстояния между точками
  const distance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Улучшенный алгоритм сглаживания без разрывов
  const drawSmoothStroke = (points: Point[]) => {
    if (!ctx || points.length < 2) return;

    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Рисуем непрерывную сглаженную линию
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      
      // Вычисляем скорость
      const dist = distance(p0, p1);
      const timeDiff = p1.time - p0.time || 1;
      const speed = dist / timeDiff;
      
      // Динамическая толщина
      const minWidth = 1.5;
      const maxWidth = 3.5;
      const width = Math.max(minWidth, Math.min(maxWidth, maxWidth - speed * 0.3));
      ctx.lineWidth = width;
      
      // Используем квадратичную кривую для плавности
      const xc = (p1.x + p2.x) / 2;
      const yc = (p1.y + p2.y) / 2;
      ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
    }
    
    // Дорисовываем до последней точки
    if (points.length > 1) {
      const lastPoint = points[points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
    }
    
    ctx.stroke();
  };

  // Очистка canvas
  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setAllStrokes([]);
      setCurrentStroke([]);
    }
  };

  // Начало рисования
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const point: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        time: Date.now()
      };
      setCurrentStroke([point]);
    }
  };

  // Рисование (временная линия)
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const point: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        time: Date.now()
      };
      
      // Добавляем точку к текущему штриху
      const newStroke = [...currentStroke, point];
      setCurrentStroke(newStroke);
      
      // Рисуем временную простую линию
      if (currentStroke.length > 0) {
        const lastPoint = currentStroke[currentStroke.length - 1];
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    }
  };

  // Окончание рисования - применяем сглаживание
  const stopDrawing = () => {
    if (!ctx || !isDrawing) return;
    setIsDrawing(false);
    
    if (currentStroke.length > 1) {
      // Сохраняем штрих
      const newStrokes = [...allStrokes, currentStroke];
      setAllStrokes(newStrokes);
      
      // Перерисовываем весь canvas с эффектами
      redrawCanvas();
      
      // Рисуем новый штрих с эффектами
      drawSmoothStroke(currentStroke);
    }
    
    setCurrentStroke([]);
  };

  // Скачивание PNG с прозрачным фоном
  const downloadPNG = () => {
    if (!canvasRef.current) return;
    
    if (allStrokes.length === 0) {
      message.warning('Iltimos, avval imzo chizing');
      return;
    }

    // Создаем временный canvas для экспорта с прозрачным фоном
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // Копируем содержимое основного canvas
      tempCtx.drawImage(canvasRef.current, 0, 0);
      
      // Создаем ссылку для скачивания
      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `signature_${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          message.success('Imzo muvaffaqiyatli yuklandi!');
        }
      }, 'image/png');
    }
  };

  // Обработка загрузки файла
  const handleUpload = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    if (file.originFileObj) {
      reader.readAsDataURL(file.originFileObj);
    }
    return false; // Предотвращаем автоматическую загрузку
  };

  // Отправка подписи
  const handleSubmit = () => {
    let signatureData: string | null = null;

    if (activeTab === 'draw') {
      // Получаем данные из canvas
      if (canvasRef.current) {
        signatureData = canvasRef.current.toDataURL('image/png');
      }
    } else if (activeTab === 'upload') {
      // Используем загруженное изображение
      signatureData = uploadedImage;
    }

    if (!signatureData) {
      message.error('Iltimos, imzo qo\'ying yoki yuklang');
      return;
    }

    onSubmit(signatureData);
    handleClose();
  };

  // Закрытие модального окна
  const handleClose = () => {
    clearCanvas();
    setUploadedImage(null);
    setActiveTab('draw');
    onClose();
  };

  const tabItems = [
    {
      key: 'draw',
      label: 'Imzo chizish',
      children: (
        <div className="flex flex-col items-center space-y-4">
          {/* Canvas для рисования */}
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="cursor-crosshair"
            />
          </div>
          
          {/* Кнопки управления */}
          <div className="flex gap-3">
            <Button 
              onClick={clearCanvas}
              icon={<span>🗑️</span>}
              size="large"
            >
              Tozalash
            </Button>
            <Button 
              onClick={downloadPNG}
              icon={<DownloadOutlined />}
              type="primary"
              size="large"
              className="bg-green-600 hover:bg-green-700"
            >
              PNG yuklash
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'upload',
      label: 'Imzo yuklash',
      children: (
        <div className="flex flex-col items-center space-y-4">
          <Upload
            accept="image/*"
            beforeUpload={handleUpload}
            showUploadList={false}
            maxCount={1}
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-primary cursor-pointer transition-colors bg-gray-50">
              <div className="flex flex-col items-center space-y-3">
                <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <p className="text-lg font-medium">Upload signature</p>
                <p className="text-sm text-gray-500">PNG, JPG yoki JPEG</p>
              </div>
            </div>
          </Upload>
          {uploadedImage && (
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
              <img 
                src={uploadedImage} 
                alt="Yuklangan imzo" 
                className="max-w-full h-auto max-h-64"
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="text-center">
          <h3 className="text-xl font-bold">Hujjatni imzolash</h3>
          <p className="text-sm text-gray-500 mt-1">{documentTitle}</p>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Bekor qilish
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          className="bg-primary hover:bg-primary-dark"
        >
          Submit signature
        </Button>,
      ]}
      centered
    >
      <div className="py-4">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems}
          centered
        />
      </div>
    </Modal>
  );
};

export default SignatureModal;
