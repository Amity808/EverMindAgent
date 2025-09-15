# AI Model Sources and Datasets

This document provides comprehensive sources for AI models and datasets that can be uploaded to the EverMind AI platform.

## 🤖 AI Model Sources

### 1. Hugging Face Hub

**URL:** https://huggingface.co/models
**Description:** The largest collection of pre-trained models for NLP, computer vision, audio, and more.

**Popular Models:**

- **GPT Models:** `gpt2`, `gpt2-medium`, `gpt2-large`
- **BERT Models:** `bert-base-uncased`, `bert-large-uncased`
- **T5 Models:** `t5-small`, `t5-base`, `t5-large`
- **Vision Models:** `resnet-50`, `vit-base-patch16-224`
- **Audio Models:** `wav2vec2-base`, `whisper-tiny`

**Download Instructions:**

```python
from transformers import AutoModel, AutoTokenizer

# Download model
model = AutoModel.from_pretrained("model-name")
tokenizer = AutoTokenizer.from_pretrained("model-name")

# Save locally
model.save_pretrained("./local-model")
tokenizer.save_pretrained("./local-model")
```

### 2. PyTorch Hub

**URL:** https://pytorch.org/hub/
**Description:** Pre-trained models for computer vision, NLP, and audio processing.

**Popular Models:**

- **ResNet:** `resnet18`, `resnet50`, `resnet101`
- **DenseNet:** `densenet121`, `densenet201`
- **EfficientNet:** `efficientnet_b0`, `efficientnet_b7`
- **Vision Transformer:** `vit_b_16`, `vit_l_16`

**Download Instructions:**

```python
import torch

# Download model
model = torch.hub.load('pytorch/vision', 'resnet50', pretrained=True)

# Save model
torch.save(model.state_dict(), 'resnet50.pth')
```

### 3. TensorFlow Hub

**URL:** https://tfhub.dev/
**Description:** Pre-trained models for various tasks using TensorFlow.

**Popular Models:**

- **Image Classification:** `efficientnet/b0`, `mobilenet_v2`
- **Object Detection:** `ssd_mobilenet_v2`, `faster_rcnn`
- **NLP:** `universal-sentence-encoder`, `bert`

**Download Instructions:**

```python
import tensorflow as tf
import tensorflow_hub as hub

# Download model
model = hub.load("https://tfhub.dev/google/efficientnet/b0/classification/1")

# Save model
tf.saved_model.save(model, "./efficientnet_b0")
```

### 4. ONNX Model Zoo

**URL:** https://github.com/onnx/models
**Description:** Collection of pre-trained models in ONNX format.

**Popular Models:**

- **Image Classification:** `resnet50`, `mobilenetv2`
- **Object Detection:** `yolov4`, `ssd`
- **NLP:** `bert-base`, `gpt2`

**Download Instructions:**

```bash
# Clone the repository
git clone https://github.com/onnx/models.git

# Navigate to specific model
cd models/vision/classification/resnet/model
```

### 5. ModelScope (Alibaba)

**URL:** https://modelscope.cn/
**Description:** Chinese AI model hub with various pre-trained models.

**Popular Models:**

- **Large Language Models:** `Qwen-7B`, `ChatGLM-6B`
- **Vision Models:** `CLIP`, `DALL-E`
- **Audio Models:** `Whisper`, `Wav2Vec2`

### 6. OpenVINO Model Zoo

**URL:** https://github.com/openvinotoolkit/open_model_zoo
**Description:** Intel's collection of optimized models for inference.

**Popular Models:**

- **Computer Vision:** `mobilenet-v2`, `yolo-v3`
- **NLP:** `bert-base`, `gpt-2`
- **Speech:** `wav2vec2`, `whisper`

## 📊 Dataset Sources

### 1. Hugging Face Datasets

**URL:** https://huggingface.co/datasets
**Description:** Large collection of datasets for various ML tasks.

**Popular Datasets:**

- **NLP:** `squad`, `glue`, `imdb`, `yelp_review_full`
- **Computer Vision:** `cifar10`, `imagenet`, `coco`
- **Audio:** `librispeech`, `common_voice`

**Download Instructions:**

```python
from datasets import load_dataset

# Load dataset
dataset = load_dataset("squad")

# Save locally
dataset.save_to_disk("./squad_dataset")
```

### 2. Kaggle Datasets

**URL:** https://www.kaggle.com/datasets
**Description:** Community-driven dataset platform with competitions.

**Popular Datasets:**

- **Computer Vision:** `cifar-10`, `mnist`, `fashion-mnist`
- **NLP:** `sentiment-analysis`, `text-classification`
- **Tabular:** `titanic`, `house-prices`, `customer-segmentation`

**Download Instructions:**

```bash
# Install Kaggle API
pip install kaggle

# Download dataset
kaggle datasets download -d dataset-name
```

### 3. UCI Machine Learning Repository

**URL:** https://archive.ics.uci.edu/ml/index.php
**Description:** Classic repository of machine learning datasets.

**Popular Datasets:**

- **Iris:** `iris.data`
- **Wine:** `wine.data`
- **Breast Cancer:** `breast-cancer-wisconsin.data`

### 4. Google Dataset Search

**URL:** https://datasetsearch.research.google.com/
**Description:** Search engine for datasets across the web.

### 5. Papers with Code Datasets

**URL:** https://paperswithcode.com/datasets
**Description:** Datasets associated with research papers.

### 6. OpenML

**URL:** https://www.openml.org/
**Description:** Open machine learning platform with datasets and experiments.

## 🛠️ Model Conversion Tools

### 1. ONNX Conversion

```python
# PyTorch to ONNX
import torch
import torch.onnx

model = torch.load('model.pth')
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(model, dummy_input, "model.onnx")

# TensorFlow to ONNX
import tf2onnx
import tensorflow as tf

model = tf.keras.models.load_model('model.h5')
onnx_model, _ = tf2onnx.convert.from_keras(model)
```

### 2. Model Quantization

```python
# PyTorch Quantization
import torch.quantization as quantization

model = torch.load('model.pth')
quantized_model = quantization.quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)
torch.save(quantized_model.state_dict(), 'model_quantized.pth')
```

### 3. Model Compression

```python
# Model Pruning
import torch.nn.utils.prune as prune

model = torch.load('model.pth')
prune.global_unstructured(
    parameters_to_prune,
    pruning_method=prune.L1Unstructured,
    amount=0.2,
)
```

## 📁 Supported File Formats

### AI Models

- **PyTorch:** `.pt`, `.pth`, `.pkl`
- **TensorFlow:** `.h5`, `.keras`, `.pb`
- **ONNX:** `.onnx`
- **Hugging Face:** `.bin`, `.safetensors`
- **CoreML:** `.mlmodel`
- **TensorFlow Lite:** `.tflite`

### Datasets

- **JSON:** `.json`, `.jsonl`
- **CSV:** `.csv`
- **Text:** `.txt`
- **Parquet:** `.parquet`
- **Arrow:** `.arrow`, `.feather`
- **HDF5:** `.h5`, `.hdf5`

## 🔧 Platform Integration

### Upload Process

1. **File Validation:** Check format and size limits
2. **Metadata Extraction:** Extract model/dataset information
3. **Storage Upload:** Upload to decentralized storage (IPFS/0G)
4. **Hash Generation:** Generate content hashes for blockchain
5. **Smart Contract:** Mint NFT with storage hashes

### Example Upload Code

```typescript
// Upload AI model
const modelFile = new File([modelData], "model.pth", {
  type: "application/octet-stream",
});
const modelResult = await storageService.uploadFile(modelFile, {
  type: "ai-model",
  framework: "pytorch",
  version: "1.0.0",
});

// Upload dataset
const datasetFile = new File([datasetData], "dataset.json", {
  type: "application/json",
});
const datasetResult = await storageService.uploadFile(datasetFile, {
  type: "dataset",
  format: "json",
  samples: 1000,
});
```

## 🚀 Getting Started

1. **Choose a Model:** Select from the sources above
2. **Download/Convert:** Get the model in a supported format
3. **Prepare Dataset:** Gather training data if needed
4. **Upload to Platform:** Use the minting form to upload
5. **Mint NFT:** Create your AI agent as an NFT

## 📚 Additional Resources

- [Hugging Face Documentation](https://huggingface.co/docs)
- [PyTorch Documentation](https://pytorch.org/docs/)
- [TensorFlow Documentation](https://tensorflow.org/docs)
- [ONNX Documentation](https://onnx.ai/onnx/)
- [0G Storage Documentation](https://0g.ai/)

## 🤝 Contributing

If you find additional model sources or have suggestions for supported formats, please contribute to this documentation!

