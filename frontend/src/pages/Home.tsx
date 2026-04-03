import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  PenLine,
  X,
  Plus,
  Trash2,
  Send,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Sunrise,
  Sun,
  Moon,
  Sparkles,
  Clock,
  ScanLine,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/client';
import { currencies } from '@/utils/currencies';
import type { UploadResponse, ManualExpenseRequest, ReceiptItem, TodayReceipt, TodayReceiptsResponse } from '@/types';
import styles from './Home.module.css';

const categoryOptions = [
  'Food & Groceries', 'Dining Out', 'Snacks & Beverages', 'Transportation',
  'Fuel', 'Parking', 'Shopping', 'Clothing & Fashion', 'Electronics',
  'Home & Furniture', 'Utilities', 'Rent / Housing', 'Health & Pharmacy',
  'Personal Care', 'Fitness & Gym', 'Entertainment', 'Subscriptions',
  'Travel', 'Education', 'Financial (Bills, Taxes, Insurance, Fees)',
  'Gifts & Donations', 'Tips & Service Charges', 'Discounts & Cashback',
  'Miscellaneous',
];

type Tab = 'receipt' | 'manual';

export default function Home() {
  const { name, email } = useAuth();
  const displayName = name || email?.split('@')[0] || 'there';

  const [activeTab, setActiveTab] = useState<Tab>('receipt');
  const [todayTxns, setTodayTxns] = useState<TodayReceipt[]>([]);
  const [expandedReceipt, setExpandedReceipt] = useState<TodayReceipt | null>(null);

  // Receipt upload state
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currency, setCurrency] = useState('INR');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Manual expense state
  const [merchant, setMerchant] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualCurrency, setManualCurrency] = useState('INR');
  const [items, setItems] = useState<ReceiptItem[]>([
    { name: '', price: 0, quantity: 1, category: 'Miscellaneous' },
  ]);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState<UploadResponse | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  // Fetch today's receipts on mount
  useEffect(() => {
    const fetchToday = async () => {
      try {
        const data = await api.get<TodayReceiptsResponse>('/todayreceipts');
        if (data.receipts) setTodayTxns(data.receipts);
      } catch {
        // silently fail — empty state is fine
      }
    };
    fetchToday();
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadResult(null);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('currency', currency);
      const data = await api.post<UploadResponse>('/uploadreceipt', formData);
      setUploadResult(data);
      // Re-fetch today's receipts to include the new one
      const todayData = await api.get<TodayReceiptsResponse>('/todayreceipts');
      if (todayData.receipts) setTodayTxns(todayData.receipts);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!merchant || items.length === 0) return;
    setManualLoading(true);
    setManualError(null);
    try {
      const body: ManualExpenseRequest = {
        merchant,
        date: manualDate,
        currency: manualCurrency,
        items: items.filter((i) => i.name.trim() !== ''),
      };
      const data = await api.post<UploadResponse>('/manualexpense', body);
      setManualResult(data);
      setMerchant('');
      setItems([{ name: '', price: 0, quantity: 1, category: 'Miscellaneous' }]);
      // Re-fetch today's receipts
      const todayData = await api.get<TodayReceiptsResponse>('/todayreceipts');
      if (todayData.receipts) setTodayTxns(todayData.receipts);
    } catch (err: any) {
      setManualError(err.message || 'Failed to add expense');
    } finally {
      setManualLoading(false);
    }
  };

  const addItem = () => setItems([...items, { name: '', price: 0, quantity: 1, category: 'Miscellaneous' }]);
  const removeItem = (idx: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };
  const updateItem = (idx: number, field: keyof ReceiptItem, value: string | number) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };
  const clearUpload = () => { setPreview(null); setSelectedFile(null); setUploadResult(null); setUploadError(null); };

  const GreetingIcon = () => {
    const h = new Date().getHours();
    if (h < 12) return <Sunrise size={24} className={styles.greetIcon} />;
    if (h < 17) return <Sun size={24} className={styles.greetIcon} />;
    return <Moon size={24} className={styles.greetIcon} />;
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currencySelect = (value: string, onChange: (v: string) => void) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={styles.select}>
      {currencies.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>)}
    </select>
  );

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <motion.div className={styles.greeting} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1><GreetingIcon /> {greeting()}, {displayName}</h1>
          <p>What did you spend on today?</p>
        </motion.div>

        <div className={styles.layout}>
          {/* ── Left: Upload area ── */}
          <motion.div className={styles.uploadSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className={styles.tabBar}>
              <button className={`${styles.tabBtn} ${activeTab === 'receipt' ? styles.tabActive : ''}`} onClick={() => setActiveTab('receipt')}>
                <Camera size={16} /> Scan Receipt
              </button>
              <button className={`${styles.tabBtn} ${activeTab === 'manual' ? styles.tabActive : ''}`} onClick={() => setActiveTab('manual')}>
                <PenLine size={16} /> Add Manually
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'receipt' ? (
                <motion.div key="receipt" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={styles.tabContent}>
                  {!preview ? (
                    <div className={styles.dropZone} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                      <div className={styles.dropIconWrap}><Camera size={32} /></div>
                      <p className={styles.dropTitle}>Drop your receipt here</p>
                      <p className={styles.dropSub}>or choose an option below</p>
                      <div className={styles.uploadBtns}>
                        <button className={styles.uploadBtn} onClick={() => cameraInputRef.current?.click()}><Camera size={18} /> Take Photo</button>
                        <button className={styles.uploadBtn} onClick={() => fileInputRef.current?.click()}><ImageIcon size={18} /> From Gallery</button>
                      </div>
                      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                    </div>
                  ) : (
                    <div className={styles.previewArea}>
                      <div className={styles.previewImgWrap}>
                        <img src={preview} alt="Receipt preview" className={styles.previewImg} />
                        <button className={styles.clearBtn} onClick={clearUpload} aria-label="Remove image"><X size={16} /></button>
                      </div>
                      <div className={styles.currencyRow}>
                        <label>Currency</label>
                        {currencySelect(currency, setCurrency)}
                      </div>
                      <button className={styles.submitBtn} onClick={handleUpload} disabled={uploading}>
                        {uploading ? <><Loader2 size={18} className={styles.spin} /> Processing...</> : <><Upload size={18} /> Upload & Scan</>}
                      </button>
                    </div>
                  )}
                  <AnimatePresence>
                    {uploadResult && (
                      <motion.div className={styles.resultCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className={styles.resultHeader}><CheckCircle2 size={20} color="var(--green-dark)" /><span>Receipt scanned successfully</span></div>
                        <div className={styles.resultBody}>
                          <div className={styles.resultRow}><span><ShoppingBag size={14} /> Merchant</span><strong>{uploadResult.merchant}</strong></div>
                          <div className={styles.resultRow}><span><Clock size={14} /> Date</span><strong>{uploadResult.date}</strong></div>
                          <div className={styles.resultRow}><span><Sparkles size={14} /> Total</span><strong className={styles.resultAmount}>{uploadResult.currency} {uploadResult.totalAmount.toFixed(2)}</strong></div>
                          <div className={styles.resultItems}>
                            {uploadResult.items.map((item, i) => (
                              <div key={i} className={styles.resultItem}><span>{item.name}</span><span>{uploadResult.currency} {item.price}</span></div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {uploadError && <div className={styles.errorMsg}><AlertCircle size={16} /> {uploadError}</div>}
                </motion.div>
              ) : (
                <motion.div key="manual" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.tabContent}>
                  <div className={styles.manualForm}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}><label><ShoppingBag size={13} /> Merchant</label><input type="text" placeholder="e.g. Street Food Stall" value={merchant} onChange={(e) => setMerchant(e.target.value)} className={styles.input} /></div>
                      <div className={styles.formGroup}><label><Clock size={13} /> Date</label><input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className={styles.input} /></div>
                      <div className={styles.formGroup}><label>Currency</label>{currencySelect(manualCurrency, setManualCurrency)}</div>
                    </div>
                    <div className={styles.itemsSection}>
                      <div className={styles.itemsHeader}><span>Items</span><button className={styles.addItemBtn} onClick={addItem}><Plus size={14} /> Add Item</button></div>
                      {items.map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                          <div className={styles.itemRowTop}>
                            <input type="text" placeholder="Item name" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} className={styles.input} />
                            <input type="number" placeholder="Price" value={item.price || ''} onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)} className={`${styles.input} ${styles.inputSmall}`} />
                            <input type="number" placeholder="Qty" value={item.quantity} min={1} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className={`${styles.input} ${styles.inputTiny}`} />
                          </div>
                          <div className={styles.itemRowBottom}>
                            <select value={item.category} onChange={(e) => updateItem(idx, 'category', e.target.value)} className={styles.select}>
                              {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button className={styles.removeItemBtn} onClick={() => removeItem(idx)} disabled={items.length <= 1} aria-label="Remove item"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className={styles.submitBtn} onClick={handleManualSubmit} disabled={manualLoading || !merchant}>
                      {manualLoading ? <><Loader2 size={18} className={styles.spin} /> Saving...</> : <><Send size={18} /> Add Expense</>}
                    </button>
                  </div>
                  <AnimatePresence>
                    {manualResult && (
                      <motion.div className={styles.resultCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className={styles.resultHeader}><CheckCircle2 size={20} color="var(--green-dark)" /><span>Expense added</span></div>
                        <div className={styles.resultBody}>
                          <div className={styles.resultRow}><span>Total</span><strong className={styles.resultAmount}>{manualResult.currency} {manualResult.totalAmount.toFixed(2)}</strong></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {manualError && <div className={styles.errorMsg}><AlertCircle size={16} /> {manualError}</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Right: Today's transactions ── */}
          <motion.div className={styles.todaySection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className={styles.todayHeader}>
              <h2><Clock size={18} /> Today's Spending</h2>
              {todayTxns.length > 0 && (
                <span className={styles.todayTotal}>{todayTxns.reduce((sum, t) => sum + t.totalAmount, 0).toFixed(2)}</span>
              )}
            </div>
            {todayTxns.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <img src="https://illustrations.popsy.co/violet/taking-notes.svg" alt="No expenses yet" className={styles.emptyIllustration} />
                </div>
                <p>No expenses yet today</p>
                <p className={styles.emptySub}>Upload a receipt or add one manually to get started</p>
              </div>
            ) : (
              <div className={styles.txnList}>
                {todayTxns.map((txn, i) => (
                  <motion.div
                    key={txn.receiptID}
                    className={styles.txnCard}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setExpandedReceipt(txn)}
                  >
                    <div className={styles.txnTop}>
                      <div className={styles.txnMerchant}><ShoppingBag size={16} /><span>{txn.merchant}</span></div>
                      <span className={styles.txnAmount}>{txn.currency} {txn.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className={styles.txnCategories}>
                      {Object.entries(txn.categoriesSummary).map(([cat, amt]) => (
                        <span key={cat} className={styles.txnCatTag}>{cat}: {amt.toFixed(0)}</span>
                      ))}
                    </div>
                    <div className={styles.txnMeta}>
                      {txn.source === 'scan' && <span className={styles.txnSource}><ScanLine size={12} /> Scanned</span>}
                      {txn.source === 'manual' && <span className={styles.txnSource}><PenLine size={12} /> Manual</span>}
                      {txn.confidenceScore < 1 && <span className={styles.txnConfidence}><Sparkles size={12} /> {(txn.confidenceScore * 100).toFixed(0)}%</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* ── Expanded receipt modal ── */}
      <AnimatePresence>
        {expandedReceipt && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedReceipt(null)}
          >
            <motion.div
              className={styles.modalCard}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.modalClose} onClick={() => setExpandedReceipt(null)} aria-label="Close"><X size={20} /></button>

              <div className={styles.modalHeader}>
                <div className={styles.modalMerchant}>
                  <ShoppingBag size={22} />
                  <div>
                    <h2>{expandedReceipt.merchant}</h2>
                    <span className={styles.modalDate}>{expandedReceipt.date}</span>
                  </div>
                </div>
                <div className={styles.modalTotal}>
                  <span className={styles.modalTotalLabel}>Total</span>
                  <span className={styles.modalTotalValue}>{expandedReceipt.currency} {expandedReceipt.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.modalMeta}>
                {expandedReceipt.source === 'scan' && <span className={styles.modalTag}><ScanLine size={13} /> Scanned Receipt</span>}
                {expandedReceipt.source === 'manual' && <span className={styles.modalTag}><PenLine size={13} /> Manual Entry</span>}
                {expandedReceipt.confidenceScore < 1 && (
                  <span className={styles.modalTag}><Sparkles size={13} /> AI Confidence: {(expandedReceipt.confidenceScore * 100).toFixed(0)}%</span>
                )}
              </div>

              <div className={styles.modalItems}>
                <div className={styles.modalItemsHeader}>
                  <span>Item</span>
                  <span>Category</span>
                  <span>Qty</span>
                  <span>Price</span>
                </div>
                {expandedReceipt.items.map((item, i) => (
                  <div key={i} className={styles.modalItem}>
                    <span className={styles.modalItemName}>{item.name}</span>
                    <span className={styles.modalItemCat}>{item.category}</span>
                    <span className={styles.modalItemQty}>{item.quantity}</span>
                    <span className={styles.modalItemPrice}>{expandedReceipt.currency} {item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.modalCategories}>
                <h3>Category Breakdown</h3>
                <div className={styles.modalCatList}>
                  {Object.entries(expandedReceipt.categoriesSummary)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amt]) => (
                      <div key={cat} className={styles.modalCatItem}>
                        <span>{cat}</span>
                        <strong>{expandedReceipt.currency} {amt.toFixed(2)}</strong>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
