import { useState } from 'react';
import {
  DRIVERS,
  DRIVER_TABS,
  MIX_TINTS,
  type DriverTab,
  type SavedDriver,
} from '../drivers';
import { AssetImg } from './AssetImg';

interface Props {
  onPick(driver: SavedDriver): void;
  title?: string;
}

const MIX_IDS = ['1', '2', '3', '4'] as const;

export function DriverGallery({ onPick, title }: Props): JSX.Element {
  const [tab, setTab] = useState<DriverTab>('animals');
  const [helm, setHelm] = useState<(typeof MIX_IDS)[number]>('1');
  const [face, setFace] = useState<(typeof MIX_IDS)[number]>('1');
  const [body, setBody] = useState<(typeof MIX_IDS)[number]>('1');
  const [tint, setTint] = useState<(typeof MIX_TINTS)[number]>(MIX_TINTS[0]!);

  const presets = DRIVERS.filter((d) => d.tab === tab);

  return (
    <section className="gallery">
      {title ? <h1 className="sr-only">{title}</h1> : null}
      <div className="tabs" role="tablist">
        {DRIVER_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? 'is-on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <AssetImg src={t.file} fallback={t.emoji} className="tab-img" />
          </button>
        ))}
      </div>

      {tab !== 'mix' ? (
        <div className="grid">
          {presets.map((d) => (
            <button
              key={d.id}
              type="button"
              className="driver-card"
              style={{ background: d.tint }}
              onClick={() => onPick({ kind: 'preset', id: d.id })}
            >
              <AssetImg src={d.file} fallback={d.emoji} className="driver-img" />
            </button>
          ))}
        </div>
      ) : (
        <div className="mixer">
          <div className="mix-preview" style={{ background: tint }}>
            <AssetImg src={`/assets/drivers/mix/mix_helm_${helm}.png`} fallback="⛑️" className="mix-img" />
            <AssetImg src={`/assets/drivers/mix/mix_face_${face}.png`} fallback="😊" className="mix-img" />
            <AssetImg src={`/assets/drivers/mix/mix_body_${body}.png`} fallback="👕" className="mix-img" />
          </div>
          <Row
            prefix="helm"
            value={helm}
            onPick={setHelm}
          />
          <Row prefix="face" value={face} onPick={setFace} />
          <Row prefix="body" value={body} onPick={setBody} />
          <div className="row">
            {MIX_TINTS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${tint === c ? 'is-on' : ''}`}
                style={{ background: c }}
                onClick={() => setTint(c)}
                aria-label={c}
              />
            ))}
          </div>
          <button
            type="button"
            className="go-btn"
            onClick={() => onPick({ kind: 'mix', helm, face, body, tint })}
          >
            ✓
          </button>
        </div>
      )}
    </section>
  );
}

function Row({
  prefix,
  value,
  onPick,
}: {
  prefix: 'helm' | 'face' | 'body';
  value: (typeof MIX_IDS)[number];
  onPick(v: (typeof MIX_IDS)[number]): void;
}): JSX.Element {
  return (
    <div className="row">
      {MIX_IDS.map((id) => (
        <button
          key={id}
          type="button"
          className={`chip ${value === id ? 'is-on' : ''}`}
          onClick={() => onPick(id)}
        >
          <AssetImg src={`/assets/drivers/mix/mix_${prefix}_${id}.png`} fallback={id} className="mix-thumb" />
        </button>
      ))}
    </div>
  );
}
