import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PosProductGrid } from "./pos/PosProductGrid";
import { PosCart } from "./pos/PosCart";
import type { CartItem, PosProduct } from "./pos/PosTypes";

export function PosPage() {
  const [activeTab, setActiveTab] = useState("Tất cả sản phẩm");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paid, setPaid] = useState(false);
  const [allProducts, setAllProducts] = useState<PosProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllProducts(data);
      })
      .catch(console.error);
  }, []);

  const tabs = [
    "Tất cả sản phẩm",
    ...Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts = (
    activeTab === "Tất cả sản phẩm"
      ? allProducts
      : allProducts.filter((p) => p.category === activeTab)
  ).filter((p) => {
    if (!searchQuery.trim()) return true;
    return p.name?.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  const handleAddToCart = (product: PosProduct) => {
    if (!product?.id || product.stockQuantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: Math.min(i.qty + 1, i.stockQuantity) }
            : i
        );
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          unitPrice: product.price,
          stockQuantity: product.stockQuantity,
          qty: 1,
        },
      ];
    });
    setPaid(false);
  };

  const handleChangeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id
            ? { ...i, qty: Math.min(i.stockQuantity, Math.max(0, i.qty + delta)) }
            : i
        )
        .filter((i) => i.qty > 0)
    );
    setPaid(false);
  };

  const handleConfirmPayment = () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const discount = subtotal > 0 ? Math.min(10000, subtotal) : 0;
    const total = Math.max(0, subtotal - discount);

    setPaid(true);
    toast.success(`Thanh toán đơn hàng ${total.toLocaleString("vi-VN")}₫ thành công!`);
    setTimeout(() => {
      setCart([]);
      setPaid(false);
    }, 1800);
  };

  return (
    <div className="flex flex-1 gap-[24px] items-start min-h-0 p-[24px] sm:p-[32px] w-full">
      <PosProductGrid
        products={filteredProducts}
        tabs={tabs}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSelectTab={setActiveTab}
        onSearchChange={setSearchQuery}
        onAddToCart={handleAddToCart}
      />
      <PosCart
        cart={cart}
        paid={paid}
        onChangeQty={handleChangeQty}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}
export default PosPage;
