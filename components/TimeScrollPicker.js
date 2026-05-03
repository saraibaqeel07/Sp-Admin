"use client";
import { useState, useRef, useEffect } from 'react';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const ITEM_H = 36;
const VISIBLE = 5;

function Column({ items, selected, onSelect }) {
  const listRef = useRef(null);
  const timerRef = useRef(null);
  const suppressRef = useRef(false);

  const scrollToIndex = (idx, smooth = false) => {
    if (!listRef.current) return;
    listRef.current.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'instant' });
  };

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx >= 0) {
      suppressRef.current = true;
      scrollToIndex(idx, false);
      setTimeout(() => { suppressRef.current = false; }, 50);
    }
  }, [selected]);

  const handleScroll = () => {
    if (suppressRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!listRef.current) return;
      const idx = Math.round(listRef.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      onSelect(items[clamped]);
      suppressRef.current = true;
      scrollToIndex(clamped, true);
      setTimeout(() => { suppressRef.current = false; }, 200);
    }, 120);
  };

  return (
    <div style={{ position: 'relative', width: 52 }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        left: 2, right: 2,
        height: ITEM_H,
        border: '2px solid #3b82f6',
        borderRadius: 7,
        pointerEvents: 'none',
        zIndex: 2,
      }} />
      <style>{`.tsp-col::-webkit-scrollbar{display:none}`}</style>
      <div
        ref={listRef}
        className="tsp-col"
        onScroll={handleScroll}
        style={{
          height: VISIBLE * ITEM_H,
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {Array(Math.floor(VISIBLE / 2)).fill(0).map((_, i) => (
          <div key={`t${i}`} style={{ height: ITEM_H }} />
        ))}
        {items.map((item, idx) => (
          <div
            key={item}
            onClick={() => { onSelect(item); scrollToIndex(idx, true); }}
            style={{
              height: ITEM_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: item === selected ? 600 : 400,
              color: item === selected ? '#fff' : 'rgba(255,255,255,0.3)',
              userSelect: 'none',
              transition: 'color 0.15s',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {item}
          </div>
        ))}
        {Array(Math.floor(VISIBLE / 2)).fill(0).map((_, i) => (
          <div key={`b${i}`} style={{ height: ITEM_H }} />
        ))}
      </div>
    </div>
  );
}

export default function TimeScrollPicker({ value, onChange, className, placeholder, errStyle }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const parse = (val) => {
    if (!val || !val.includes(':')) return { h: '12', m: '00' };
    const [h, m] = val.split(':');
    return {
      h: HOURS.includes(h) ? h : '12',
      m: MINUTES.includes(m) ? m : '00',
    };
  };

  const { h: hour, m: minute } = parse(value);

  const handleHour = (h) => onChange(`${h}:${minute}`);
  const handleMinute = (m) => onChange(`${hour}:${m}`);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        readOnly
        className={className}
        value={value ? `${hour} : ${minute}` : ''}
        placeholder={placeholder || 'HH : MM'}
        onClick={() => setOpen(o => !o)}
        style={{ cursor: 'pointer', ...errStyle }}
      />
      {open && (
        <div style={{
          position: 'absolute',
          zIndex: 1000,
          top: 'calc(100% + 6px)',
          left: 0,
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        }}>
          <Column items={HOURS} selected={hour} onSelect={handleHour} />
          <span style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 20,
            fontWeight: 700,
            lineHeight: `${ITEM_H}px`,
            marginBottom: 2,
          }}>:</span>
          <Column items={MINUTES} selected={minute} onSelect={handleMinute} />
        </div>
      )}
    </div>
  );
}
