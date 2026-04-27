"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, GripVertical, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n"

interface Category {
  id: string
  name: string
  name_en?: string
  parent_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

interface CategoryManagerProps {
  initialCategories: Category[]
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter()
  const { locale } = useI18n()
  const [categories, setCategories] = useState(initialCategories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    name_en: "",
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const t = {
    title: locale === "zh" ? "分类管理" : "Category Management",
    subtitle: locale === "zh" ? "管理产品分类" : "Manage product categories",
    addCategory: locale === "zh" ? "新增分类" : "Add Category",
    editCategory: locale === "zh" ? "编辑分类" : "Edit Category",
    categoryList: locale === "zh" ? "分类列表" : "Category List",
    name: locale === "zh" ? "分类名称" : "Category Name",
    nameEn: locale === "zh" ? "英文名称" : "English Name",
    enabled: locale === "zh" ? "启用" : "Enabled",
    save: locale === "zh" ? "保存" : "Save",
    cancel: locale === "zh" ? "取消" : "Cancel",
    saving: locale === "zh" ? "保存中..." : "Saving...",
    noCategories: locale === "zh" ? "暂无分类，请点击上方按钮添加" : "No categories yet, click above to add",
    confirmDelete: locale === "zh" ? "确定要删除此分类吗？" : "Are you sure you want to delete this category?",
    addSuccess: locale === "zh" ? "分类添加成功" : "Category added successfully",
    updateSuccess: locale === "zh" ? "分类更新成功" : "Category updated successfully",
    deleteSuccess: locale === "zh" ? "分类删除成功" : "Category deleted successfully",
    error: locale === "zh" ? "操作失败，请重试" : "Operation failed, please try again",
  }

  const resetForm = () => {
    setFormData({ name: "", name_en: "", is_active: true })
    setEditingCategory(null)
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setFormData({
      name: category.name,
      name_en: category.name_en || "",
      is_active: category.is_active,
    })
    setEditingCategory(category)
    setIsAddDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      if (editingCategory) {
        // Update existing
        const { error } = await supabase
          .from("categories")
          .update({
            name: formData.name,
            name_en: formData.name_en || null,
            is_active: formData.is_active,
          })
          .eq("id", editingCategory.id)

        if (error) throw error

        setCategories(prev =>
          prev.map(c =>
            c.id === editingCategory.id
              ? { ...c, name: formData.name, name_en: formData.name_en, is_active: formData.is_active }
              : c
          )
        )
        toast.success(t.updateSuccess)
      } else {
        // Create new
        const maxOrder = categories.length > 0
          ? Math.max(...categories.map(c => c.sort_order || 0))
          : 0

        const { data, error } = await supabase
          .from("categories")
          .insert({
            name: formData.name,
            name_en: formData.name_en || null,
            is_active: formData.is_active,
            sort_order: maxOrder + 1,
          })
          .select()
          .single()

        if (error) throw error

        setCategories(prev => [...prev, data])
        toast.success(t.addSuccess)
      }

      handleCloseDialog()
      router.refresh()
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error(t.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("categories")
      .update({ is_active: isActive })
      .eq("id", id)

    if (error) {
      toast.error(t.error)
      return
    }

    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, is_active: isActive } : c))
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return

    const supabase = createClient()
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      toast.error(t.error)
      return
    }

    setCategories(prev => prev.filter(c => c.id !== id))
    toast.success(t.deleteSuccess)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t.addCategory}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.categoryList}</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {t.noCategories}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-4"
                >
                  <GripVertical className="h-5 w-5 cursor-move text-muted-foreground" />
                  
                  <div className="flex-1">
                    <span className="font-medium text-foreground">
                      {category.name}
                    </span>
                    {category.name_en && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({category.name_en})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{t.enabled}</span>
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={(checked) => handleToggleActive(category.id, checked)}
                      />
                    </div>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t.editCategory : t.addCategory}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={locale === "zh" ? "例如：T恤" : "e.g. T-Shirts"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">{t.nameEn}</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                placeholder="e.g. T-Shirts"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">{t.enabled}</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t.saving : t.save}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
