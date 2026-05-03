"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { 
  Upload, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Download,
  Loader2,
  Package
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import Link from "next/link"

// 支持的平台模板
const PLATFORM_TEMPLATES = {
  amazon: {
    name: "Amazon",
    nameField: ["item-name", "title", "product-name", "item_name"],
    skuField: ["seller-sku", "sku", "item-sku", "seller_sku"],
    descField: ["product-description", "description", "item-description"],
    priceField: ["price", "standard-price", "your-price"],
    categoryField: ["item-type", "product-type", "category", "browse-node"],
    imageField: ["main-image-url", "image-url", "main_image_url"],
    colorField: ["color", "color_name", "variation-theme"],
    sizeField: ["size", "size_name"],
  },
  shopify: {
    name: "Shopify",
    nameField: ["Title", "title", "Handle", "handle"],
    skuField: ["Variant SKU", "SKU", "sku", "Variant Barcode"],
    descField: ["Body (HTML)", "Body", "Description"],
    priceField: ["Variant Price", "Price", "price"],
    categoryField: ["Type", "Product Type", "product_type"],
    imageField: ["Image Src", "Image", "image_src"],
    colorField: ["Option1 Value", "Color", "Option 1 Value"],
    sizeField: ["Option2 Value", "Size", "Option 2 Value"],
  },
  woocommerce: {
    name: "WooCommerce",
    nameField: ["Name", "post_title", "name"],
    skuField: ["SKU", "sku", "_sku"],
    descField: ["Description", "post_content", "description"],
    priceField: ["Regular price", "Price", "_regular_price"],
    categoryField: ["Categories", "category", "product_cat"],
    imageField: ["Images", "image", "thumbnail"],
    colorField: ["Attribute 1 value(s)", "color"],
    sizeField: ["Attribute 2 value(s)", "size"],
  },
  generic: {
    name: "通用格式",
    nameField: ["name", "title", "product_name", "产品名称", "名称"],
    skuField: ["sku", "SKU", "product_sku", "款号", "货号"],
    descField: ["description", "desc", "描述", "产品描述"],
    priceField: ["price", "unit_price", "价格", "单价"],
    categoryField: ["category", "type", "分类", "类别", "产品类型"],
    imageField: ["image", "image_url", "图片", "主图"],
    colorField: ["color", "颜色", "color_name"],
    sizeField: ["size", "尺码", "size_name"],
  },
}

interface ParsedProduct {
  id: string
  name: string
  sku: string
  description: string
  price: string
  category: string
  suggestedCategory?: string
  image: string
  color: string
  size: string
  selected: boolean
  status: "pending" | "success" | "error"
  error?: string
}

interface FieldMapping {
  name: string
  sku: string
  description: string
  price: string
  category: string
  image: string
  color: string
  size: string
}

export default function ProductImportPage() {
  const router = useRouter()
  const { locale } = useI18n()
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "complete">("upload")
  const [platform, setPlatform] = useState<string>("generic")
  const [rawData, setRawData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    name: "",
    sku: "",
    description: "",
    price: "",
    category: "",
    image: "",
    color: "",
    size: "",
  })
  const [products, setProducts] = useState<ParsedProduct[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [existingCategories, setExistingCategories] = useState<{id: string, name: string}[]>([])
  const [newCategories, setNewCategories] = useState<string[]>([])

  const t = {
    zh: {
      title: "导入产品",
      subtitle: "支持 Amazon、Shopify、WooCommerce 等平台导出的产品列表",
      uploadTitle: "上传产品文件",
      uploadDesc: "支持 CSV、Excel 格式，最大 10MB",
      dragDrop: "拖拽文件到此处，或点击选择文件",
      supportFormats: "支持格式：CSV, XLS, XLSX",
      selectPlatform: "选择平台模板",
      platformDesc: "选择您的产品来源平台，系统将自动匹配字段",
      mappingTitle: "字段映射",
      mappingDesc: "确认产品数据字段的对应关系",
      previewTitle: "预览与AI分类",
      previewDesc: "预览导入数据，使用AI自动识别并创建分类",
      aiAnalyze: "AI 智能分类",
      analyzing: "正在分析...",
      productName: "产品名称",
      productSku: "款号",
      originalCategory: "原始分类",
      aiCategory: "AI建议分类",
      selectAll: "全选",
      selectedCount: "已选择 {count} 个产品",
      newCategories: "将创建的新分类",
      startImport: "开始导入",
      importing: "正在导入...",
      importComplete: "导入完成",
      importSuccess: "成功导入 {count} 个产品",
      backToProducts: "返回产品列表",
      downloadTemplate: "下载模板",
      nextStep: "下一步",
      prevStep: "上一步",
      required: "必填",
      optional: "可选",
      fieldName: "产品名称",
      fieldSku: "款号/SKU",
      fieldDesc: "产品描述",
      fieldPrice: "价格",
      fieldCategory: "分类",
      fieldImage: "图片URL",
      fieldColor: "颜色",
      fieldSize: "尺寸",
    },
    en: {
      title: "Import Products",
      subtitle: "Support product lists exported from Amazon, Shopify, WooCommerce, etc.",
      uploadTitle: "Upload Product File",
      uploadDesc: "Support CSV, Excel format, max 10MB",
      dragDrop: "Drag and drop files here, or click to select",
      supportFormats: "Supported formats: CSV, XLS, XLSX",
      selectPlatform: "Select Platform Template",
      platformDesc: "Select your product source platform for automatic field matching",
      mappingTitle: "Field Mapping",
      mappingDesc: "Confirm the field mapping for product data",
      previewTitle: "Preview & AI Classification",
      previewDesc: "Preview import data and use AI to automatically identify and create categories",
      aiAnalyze: "AI Smart Classification",
      analyzing: "Analyzing...",
      productName: "Product Name",
      productSku: "SKU",
      originalCategory: "Original Category",
      aiCategory: "AI Suggested Category",
      selectAll: "Select All",
      selectedCount: "{count} products selected",
      newCategories: "New categories to create",
      startImport: "Start Import",
      importing: "Importing...",
      importComplete: "Import Complete",
      importSuccess: "Successfully imported {count} products",
      backToProducts: "Back to Products",
      downloadTemplate: "Download Template",
      nextStep: "Next Step",
      prevStep: "Previous Step",
      required: "Required",
      optional: "Optional",
      fieldName: "Product Name",
      fieldSku: "SKU",
      fieldDesc: "Description",
      fieldPrice: "Price",
      fieldCategory: "Category",
      fieldImage: "Image URL",
      fieldColor: "Color",
      fieldSize: "Size",
    },
  }

  const text = t[locale as keyof typeof t] || t.zh

  // 文件上传处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const reader = new FileReader()
    
    if (file.name.endsWith(".csv")) {
      reader.onload = (e) => {
        const text = e.target?.result as string
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setHeaders(results.meta.fields || [])
            setRawData(results.data)
            autoMapFields(results.meta.fields || [])
            setStep("mapping")
          },
        })
      }
      reader.readAsText(file)
    } else {
      // Excel 处理
      import("xlsx").then((XLSX) => {
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          
          if (jsonData.length > 0) {
            const fields = Object.keys(jsonData[0] as object)
            setHeaders(fields)
            setRawData(jsonData)
            autoMapFields(fields)
            setStep("mapping")
          }
        }
        reader.readAsArrayBuffer(file)
      })
    }
  }, [platform])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  // 自动匹配字段
  const autoMapFields = (fields: string[]) => {
    const template = PLATFORM_TEMPLATES[platform as keyof typeof PLATFORM_TEMPLATES] || PLATFORM_TEMPLATES.generic
    const mapping: FieldMapping = {
      name: "",
      sku: "",
      description: "",
      price: "",
      category: "",
      image: "",
      color: "",
      size: "",
    }

    const findMatch = (targetFields: string[]) => {
      for (const target of targetFields) {
        const match = fields.find(
          (f) => f.toLowerCase().replace(/[_-\s]/g, "") === target.toLowerCase().replace(/[_-\s]/g, "")
        )
        if (match) return match
      }
      return ""
    }

    mapping.name = findMatch(template.nameField)
    mapping.sku = findMatch(template.skuField)
    mapping.description = findMatch(template.descField)
    mapping.price = findMatch(template.priceField)
    mapping.category = findMatch(template.categoryField)
    mapping.image = findMatch(template.imageField)
    mapping.color = findMatch(template.colorField)
    mapping.size = findMatch(template.sizeField)

    setFieldMapping(mapping)
  }

  // 处理映射确认，进入预览
  const handleMappingConfirm = async () => {
    // 将原始数据转换为产品列表
    const parsedProducts: ParsedProduct[] = rawData.map((row, index) => ({
      id: `import-${index}`,
      name: row[fieldMapping.name] || "",
      sku: row[fieldMapping.sku] || `SKU-${Date.now()}-${index}`,
      description: row[fieldMapping.description] || "",
      price: row[fieldMapping.price] || "0",
      category: row[fieldMapping.category] || "",
      image: row[fieldMapping.image] || "",
      color: row[fieldMapping.color] || "",
      size: row[fieldMapping.size] || "",
      selected: true,
      status: "pending",
    })).filter(p => p.name) // 过滤掉没有名称的行

    setProducts(parsedProducts)
    
    // 获取现有分类
    const response = await fetch("/api/admin/categories")
    if (response.ok) {
      const data = await response.json()
      setExistingCategories(data.categories || [])
    }
    
    setStep("preview")
  }

  // AI 分析分类
  const handleAIAnalyze = async () => {
    setIsAnalyzing(true)
    
    try {
      const response = await fetch("/api/admin/products/ai-categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            originalCategory: p.category,
          })),
          existingCategories: existingCategories.map(c => c.name),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // 更新产品的建议分类
        setProducts(prev => prev.map(p => {
          const suggestion = result.suggestions.find((s: any) => s.id === p.id)
          return suggestion ? { ...p, suggestedCategory: suggestion.category } : p
        }))
        
        // 记录新分类
        setNewCategories(result.newCategories || [])
        
        toast.success(locale === "zh" ? "AI 分类完成" : "AI classification complete")
      } else {
        throw new Error("AI analysis failed")
      }
    } catch (error) {
      toast.error(locale === "zh" ? "AI 分析失败，请重试" : "AI analysis failed, please retry")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 开始导入
  const handleImport = async () => {
    setStep("importing")
    setImportProgress(0)

    const selectedProducts = products.filter(p => p.selected)
    const total = selectedProducts.length

    try {
      // 先创建新分类
      if (newCategories.length > 0) {
        await fetch("/api/admin/categories/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categories: newCategories }),
        })
      }

      // 批量导入产品
      let imported = 0
      const batchSize = 10

      for (let i = 0; i < selectedProducts.length; i += batchSize) {
        const batch = selectedProducts.slice(i, i + batchSize)
        
        const response = await fetch("/api/admin/products/batch-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products: batch.map(p => ({
              name: p.name,
              sku: p.sku,
              description: p.description,
              category: p.suggestedCategory || p.category,
              image: p.image,
              colors: p.color ? p.color.split(",").map(c => c.trim()) : [],
              sizes: p.size ? p.size.split(",").map(s => s.trim()) : [],
            })),
          }),
        })

        if (response.ok) {
          const result = await response.json()
          imported += result.imported || batch.length
        }

        setImportProgress(Math.round(((i + batch.length) / total) * 100))
      }

      setStep("complete")
      toast.success(text.importSuccess.replace("{count}", imported.toString()))
    } catch (error) {
      toast.error(locale === "zh" ? "导入失败" : "Import failed")
      setStep("preview")
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    const allSelected = products.every(p => p.selected)
    setProducts(prev => prev.map(p => ({ ...p, selected: !allSelected })))
  }

  // 单个选择
  const toggleSelect = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p))
  }

  const selectedCount = products.filter(p => p.selected).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{text.title}</h1>
          <p className="text-muted-foreground">{text.subtitle}</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {["upload", "mapping", "preview", "importing", "complete"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === s ? "bg-primary text-primary-foreground" :
              ["upload", "mapping", "preview", "importing", "complete"].indexOf(step) > i
                ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            {i < 4 && <div className={`h-0.5 w-8 ${
              ["upload", "mapping", "preview", "importing", "complete"].indexOf(step) > i
                ? "bg-primary" : "bg-muted"
            }`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{text.selectPlatform}</CardTitle>
              <CardDescription>{text.platformDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PLATFORM_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant={platform === key ? "default" : "outline"}
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setPlatform(key)}
                  >
                    <FileSpreadsheet className="h-6 w-6" />
                    <span>{template.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{text.uploadTitle}</CardTitle>
              <CardDescription>{text.uploadDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">{text.dragDrop}</p>
                <p className="text-xs text-muted-foreground">{text.supportFormats}</p>
              </div>

              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/templates/product-import-template.csv" download>
                    <Download className="mr-2 h-4 w-4" />
                    {text.downloadTemplate}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Field Mapping */}
      {step === "mapping" && (
        <Card>
          <CardHeader>
            <CardTitle>{text.mappingTitle}</CardTitle>
            <CardDescription>{text.mappingDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { key: "name", label: text.fieldName, required: true },
                { key: "sku", label: text.fieldSku, required: true },
                { key: "description", label: text.fieldDesc, required: false },
                { key: "price", label: text.fieldPrice, required: false },
                { key: "category", label: text.fieldCategory, required: false },
                { key: "image", label: text.fieldImage, required: false },
                { key: "color", label: text.fieldColor, required: false },
                { key: "size", label: text.fieldSize, required: false },
              ].map(({ key, label, required }) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {label}
                    <Badge variant={required ? "default" : "secondary"} className="text-xs">
                      {required ? text.required : text.optional}
                    </Badge>
                  </label>
                  <Select
                    value={fieldMapping[key as keyof FieldMapping]}
                    onValueChange={(value) => setFieldMapping(prev => ({ ...prev, [key]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`选择 ${label} 对应的列`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- 不映射 --</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>
                {text.prevStep}
              </Button>
              <Button 
                onClick={handleMappingConfirm}
                disabled={!fieldMapping.name}
              >
                {text.nextStep}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview & AI Classification */}
      {step === "preview" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{text.previewTitle}</CardTitle>
                  <CardDescription>{text.previewDesc}</CardDescription>
                </div>
                <Button onClick={handleAIAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {text.analyzing}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {text.aiAnalyze}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={products.every(p => p.selected)}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm">{text.selectAll}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {text.selectedCount.replace("{count}", selectedCount.toString())}
                </span>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>{text.productName}</TableHead>
                      <TableHead>{text.productSku}</TableHead>
                      <TableHead>{text.originalCategory}</TableHead>
                      <TableHead>{text.aiCategory}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 50).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={product.selected}
                            onCheckedChange={() => toggleSelect(product.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {product.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          {product.category || "-"}
                        </TableCell>
                        <TableCell>
                          {product.suggestedCategory ? (
                            <Badge variant="secondary" className="gap-1">
                              <Sparkles className="h-3 w-3" />
                              {product.suggestedCategory}
                            </Badge>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {products.length > 50 && (
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  {locale === "zh" ? `显示前 50 条，共 ${products.length} 条` : `Showing 50 of ${products.length} items`}
                </p>
              )}

              {newCategories.length > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {text.newCategories}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {newCategories.map((cat) => (
                      <Badge key={cat} variant="outline">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("mapping")}>
              {text.prevStep}
            </Button>
            <Button onClick={handleImport} disabled={selectedCount === 0}>
              {text.startImport} ({selectedCount})
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Importing */}
      {step === "importing" && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h3 className="text-lg font-semibold">{text.importing}</h3>
              <Progress value={importProgress} className="w-64 mx-auto" />
              <p className="text-sm text-muted-foreground">{importProgress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === "complete" && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
              <h3 className="text-xl font-semibold">{text.importComplete}</h3>
              <p className="text-muted-foreground">
                {text.importSuccess.replace("{count}", selectedCount.toString())}
              </p>
              <Button onClick={() => router.push("/admin/products")}>
                {text.backToProducts}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
