/* @ds-bundle: {"format":4,"namespace":"WOTDesignSystem_086a57","components":[{"name":"ActiveSessionBar","sourcePath":"components/core/ActiveSessionBar.jsx"},{"name":"AppHeader","sourcePath":"components/core/AppHeader.jsx"},{"name":"DataState","sourcePath":"components/core/DataState.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Screen","sourcePath":"components/core/Screen.jsx"},{"name":"TabBar","sourcePath":"components/core/TabBar.jsx"},{"name":"VersionFooter","sourcePath":"components/core/VersionFooter.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Chip","sourcePath":"components/forms/Chip.jsx"},{"name":"ChipGroup","sourcePath":"components/forms/Chip.jsx"},{"name":"RatingScale","sourcePath":"components/forms/RatingScale.jsx"},{"name":"TextLink","sourcePath":"components/forms/TextLink.jsx"},{"name":"UnderlineInput","sourcePath":"components/forms/UnderlineInput.jsx"},{"name":"ActionCard","sourcePath":"components/home/ActionCard.jsx"},{"name":"SessionHistoryCard","sourcePath":"components/home/SessionHistoryCard.jsx"},{"name":"WeekStrip","sourcePath":"components/home/WeekStrip.jsx"},{"name":"BalanceBars","sourcePath":"components/insights/BalanceBars.jsx"},{"name":"LoadTrendChart","sourcePath":"components/insights/LoadTrendChart.jsx"},{"name":"MetricRow","sourcePath":"components/insights/MetricRow.jsx"},{"name":"SignalCard","sourcePath":"components/insights/SignalCard.jsx"},{"name":"StrengthProgression","sourcePath":"components/insights/StrengthProgression.jsx"},{"name":"Sheet","sourcePath":"components/overlay/Sheet.jsx"},{"name":"SheetField","sourcePath":"components/overlay/Sheet.jsx"},{"name":"ExerciseBlock","sourcePath":"components/workout/ExerciseBlock.jsx"},{"name":"SetRow","sourcePath":"components/workout/SetRow.jsx"}],"sourceHashes":{"components/core/ActiveSessionBar.jsx":"899f3fde77e9","components/core/AppHeader.jsx":"7ba951a4e5f0","components/core/DataState.jsx":"b81bfb1c5ae6","components/core/Icon.jsx":"eadf00fd3cd2","components/core/Screen.jsx":"76f39f572652","components/core/TabBar.jsx":"848b7d99dae0","components/core/VersionFooter.jsx":"2bb7e32d0953","components/forms/Button.jsx":"609bc90b460c","components/forms/Chip.jsx":"80cdb2e74214","components/forms/RatingScale.jsx":"09751ee11038","components/forms/TextLink.jsx":"59f5975735c2","components/forms/UnderlineInput.jsx":"763f2ea6e2da","components/home/ActionCard.jsx":"111360c65833","components/home/SessionHistoryCard.jsx":"629f55b30ff4","components/home/WeekStrip.jsx":"ade0563b85f4","components/insights/BalanceBars.jsx":"23f5a82e3924","components/insights/LoadTrendChart.jsx":"180720ef028f","components/insights/MetricRow.jsx":"d72988554fee","components/insights/SignalCard.jsx":"f03792dcbcd2","components/insights/StrengthProgression.jsx":"70d17a5a6a04","components/overlay/Sheet.jsx":"6f1b0ed870ea","components/workout/ExerciseBlock.jsx":"41fbb91ec2b1","components/workout/SetRow.jsx":"90ab75f60c52","ui_kits/mobile-app/App.jsx":"2c130ea5049e","ui_kits/mobile-app/LoginScreen.jsx":"f8b2167262c5","ui_kits/mobile-app/Sheets.jsx":"1616ba51b8b3","ui_kits/mobile-app/TabScreens.jsx":"d62ab5f53985","ui_kits/mobile-app/WorkoutScreen.jsx":"b12ab18ec512","ui_kits/mobile-app/data.js":"5f54af3baacb","ui_kits/mobile-app/doc-page.js":"f52ae9c02fca"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.WOTDesignSystem_086a57 = window.WOTDesignSystem_086a57 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/ActiveSessionBar.jsx
try { (() => {
function ActiveSessionBar({
  label = 'Workout',
  exercises = 0,
  elapsed = '--:--',
  onPress
}) {
  const meta = {
    fontFamily: 'var(--font-body)',
    fontSize: 11,
    color: 'var(--wot-muted-fg)',
    fontVariantNumeric: 'tabular-nums'
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onPress,
    style: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 24px',
      background: 'none',
      border: 0,
      borderTop: '0.5px solid rgba(0,0,0,0.08)',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      letterSpacing: 2,
      color: 'var(--wot-primary)'
    }
  }, "\u25B6"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 13,
      color: 'var(--wot-on-surface)'
    }
  }, label)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: meta
  }, exercises, " ex"), /*#__PURE__*/React.createElement("span", {
    style: meta
  }, elapsed)));
}
Object.assign(__ds_scope, { ActiveSessionBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ActiveSessionBar.jsx", error: String((e && e.message) || e) }); }

// components/core/DataState.jsx
try { (() => {
function DataState({
  message,
  actionLabel,
  onAction,
  loading = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      border: '1px solid var(--wot-border-solid)',
      background: 'rgba(250,249,248,0.7)',
      padding: '32px 24px'
    }
  }, loading ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: '50%',
      border: '2px solid var(--wot-primary)',
      borderRightColor: 'transparent',
      animation: 'wot-spin .8s linear infinite'
    }
  }, /*#__PURE__*/React.createElement("style", null, '@keyframes wot-spin{to{transform:rotate(360deg)}}')) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 16,
      textAlign: 'center',
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      lineHeight: '20px',
      color: 'var(--wot-muted-fg)'
    }
  }, message), actionLabel && onAction ? /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      marginTop: 16,
      border: '1px solid var(--wot-primary)',
      background: 'none',
      padding: '8px 16px',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--wot-primary)'
    }
  }, actionLabel) : null);
}
Object.assign(__ds_scope, { DataState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/DataState.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
// Glyph paths copied verbatim from mobile-client/components/ui/icon-symbol.tsx (SF Symbol names, 24x24 Material-style paths).
const PATHS = {
  'house.fill': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  'clock.arrow.circlepath': 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
  'chart.bar.fill': 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
  'gearshape.fill': 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'
};
function Icon({
  name,
  size = 24,
  color = 'currentColor',
  style
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    style: {
      display: 'block',
      ...style
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: PATHS[name],
    fill: color
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/AppHeader.jsx
try { (() => {
function AppHeader({
  logoSrc = 'assets/wot-logo.svg',
  onSettings,
  showSettings = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 24px 12px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "WOT",
    style: {
      width: 132,
      height: 40,
      objectFit: 'contain'
    }
  }), showSettings ? /*#__PURE__*/React.createElement("button", {
    onClick: onSettings,
    "aria-label": "Settings",
    style: {
      position: 'absolute',
      right: 24,
      top: 16,
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "gearshape.fill",
    size: 20,
    color: "var(--wot-on-surface-variant)"
  })) : null);
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/core/Screen.jsx
try { (() => {
function Screen({
  children,
  ruled = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      backgroundColor: 'var(--wot-surface)',
      backgroundImage: ruled ? 'var(--bg-ruled)' : 'none',
      fontFamily: 'var(--font-body)',
      color: 'var(--wot-on-surface)',
      overflow: 'hidden',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Screen });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Screen.jsx", error: String((e && e.message) || e) }); }

// components/core/VersionFooter.jsx
try { (() => {
function VersionFooter({
  version = '0.0.0-alpha'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '6px 24px',
      borderTop: '0.5px solid rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 8,
      textTransform: 'uppercase',
      letterSpacing: 2,
      color: '#a3a09c'
    }
  }, "WOT v", version));
}
Object.assign(__ds_scope, { VersionFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/VersionFooter.jsx", error: String((e && e.message) || e) }); }

// components/core/TabBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TABS = [['today', 'Today', 'house.fill'], ['history', 'History', 'clock.arrow.circlepath'], ['insights', 'Insights', 'chart.bar.fill']];
function TabBar({
  active = 'today',
  onChange,
  version,
  activeSession,
  onOpenSession
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--wot-surface)',
      position: 'relative'
    }
  }, activeSession ? /*#__PURE__*/React.createElement(__ds_scope.ActiveSessionBar, _extends({}, activeSession, {
    onPress: onOpenSession
  })) : null, /*#__PURE__*/React.createElement(__ds_scope.VersionFooter, {
    version: version
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderTop: '1px solid rgba(0,0,0,0.08)',
      padding: '6px 0 10px'
    }
  }, TABS.map(([key, label, icon]) => {
    const on = key === active;
    const color = on ? 'var(--wot-primary)' : '#9a9793';
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: () => onChange && onChange(key),
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'none',
        border: 0,
        cursor: 'pointer',
        padding: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        padding: '4px 16px',
        borderRadius: 9999,
        background: on ? 'var(--wot-surface-container-highest)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: icon,
      size: 20,
      color: color
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        marginTop: 2,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: 9,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color
      }
    }, label));
  })));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TabBar.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function Button({
  children,
  variant = 'primary',
  size = 'md',
  trailing,
  disabled,
  fullWidth = true,
  onClick,
  style
}) {
  const [pressed, setPressed] = React.useState(false);
  const base = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: trailing ? 'space-between' : 'center',
    width: fullWidth ? '100%' : 'auto',
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--font-body)',
    textTransform: 'uppercase',
    boxSizing: 'border-box'
  };
  const v = variant === 'outline' ? {
    background: 'none',
    border: '1px solid var(--wot-primary)',
    color: 'var(--wot-primary)',
    padding: '8px 16px',
    fontSize: 10,
    letterSpacing: 2,
    borderRadius: 0
  } : {
    background: 'var(--wot-primary)',
    border: 0,
    color: '#fff',
    borderRadius: 16,
    fontWeight: 700,
    padding: size === 'lg' ? '20px 24px' : '16px 24px',
    fontSize: size === 'lg' ? 12 : 11,
    letterSpacing: 3,
    opacity: disabled ? 0.4 : pressed ? 0.8 : 1
  };
  return /*#__PURE__*/React.createElement("button", {
    disabled: disabled,
    onClick: onClick,
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    style: {
      ...base,
      ...v,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", null, children), trailing ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      letterSpacing: 0
    }
  }, trailing) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Chip.jsx
try { (() => {
function Chip({
  label,
  selected = false,
  size = 'md',
  tone = 'muted',
  onClick
}) {
  const pad = size === 'sm' ? '4px 12px' : size === 'xs' ? '2px 8px' : '8px 16px';
  const fs = size === 'md' ? 10 : 9;
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      borderRadius: 9999,
      border: 0,
      cursor: 'pointer',
      padding: pad,
      background: selected ? 'var(--wot-primary)' : 'var(--wot-surface-container-low)',
      fontFamily: 'var(--font-body)',
      fontSize: fs,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: selected ? '#fff' : tone === 'ink' ? 'var(--wot-on-surface)' : 'var(--wot-muted-fg)'
    }
  }, label);
}
function ChipGroup({
  options,
  value,
  onChange,
  size,
  tone,
  multi = false
}) {
  const isOn = o => multi ? (value || []).includes(o) : value === o;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, options.map(o => {
    const key = typeof o === 'string' ? o : o.key;
    const label = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement(Chip, {
      key: key,
      label: label,
      size: size,
      tone: tone,
      selected: isOn(key),
      onClick: () => onChange && onChange(multi ? isOn(key) ? value.filter(x => x !== key) : [...(value || []), key] : key)
    });
  }));
}
Object.assign(__ds_scope, { Chip, ChipGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Chip.jsx", error: String((e && e.message) || e) }); }

// components/forms/RatingScale.jsx
try { (() => {
function RatingScale({
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel,
  highLabel
}) {
  const vals = [];
  for (let i = min; i <= max; i++) vals.push(i);
  const lbl = {
    fontFamily: 'var(--font-body)',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'var(--wot-muted-fg)'
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, vals.map(n => {
    const on = value === n;
    return /*#__PURE__*/React.createElement("button", {
      key: n,
      onClick: () => onChange && onChange(n),
      style: {
        width: 44,
        height: 44,
        borderRadius: 9999,
        border: 0,
        cursor: 'pointer',
        background: on ? 'var(--wot-primary)' : 'var(--wot-surface-container-low)',
        color: on ? '#fff' : 'var(--wot-on-surface)',
        fontFamily: 'var(--font-body)',
        fontWeight: on ? 700 : 500,
        fontSize: 16,
        fontVariantNumeric: 'tabular-nums'
      }
    }, n);
  })), lowLabel || highLabel ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: lbl
  }, lowLabel), /*#__PURE__*/React.createElement("span", {
    style: lbl
  }, highLabel)) : null);
}
Object.assign(__ds_scope, { RatingScale });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RatingScale.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextLink.jsx
try { (() => {
const TONES = {
  muted: 'var(--wot-muted-fg)',
  primary: 'var(--wot-primary)',
  destructive: 'var(--wot-destructive)'
};
function TextLink({
  children,
  tone = 'muted',
  size = 10,
  tracking,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      background: 'none',
      border: 0,
      padding: '4px 0',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: size,
      letterSpacing: tracking ?? (size >= 11 ? 3 : 2),
      textTransform: 'uppercase',
      color: TONES[tone],
      textAlign: 'left',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { TextLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextLink.jsx", error: String((e && e.message) || e) }); }

// components/forms/UnderlineInput.jsx
try { (() => {
const SIZES = {
  auth: {
    fontFamily: 'var(--font-body)',
    fontSize: 17,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(0,0,0,0.15)'
  },
  body: {
    fontFamily: 'var(--font-body)',
    fontSize: 16,
    paddingBottom: 4,
    borderBottom: '1px solid var(--wot-border-solid)'
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 300,
    fontSize: 30,
    letterSpacing: -1,
    paddingBottom: 4,
    borderBottom: '1px solid var(--wot-border-solid)'
  },
  stat: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 300,
    fontSize: 22,
    lineHeight: '24px',
    paddingBottom: 2,
    borderBottom: '1px solid var(--wot-border-solid)',
    textAlign: 'right',
    minWidth: 56,
    width: 56,
    fontVariantNumeric: 'tabular-nums'
  }
};
function UnderlineInput({
  label,
  value,
  onChange,
  placeholder,
  size = 'body',
  type = 'text',
  focusAccent = false,
  style
}) {
  const s = SIZES[size];
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      ...(size === 'stat' ? {
        display: 'inline-block'
      } : null)
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 8,
      fontFamily: 'var(--font-body)',
      fontSize: 9,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange && onChange(e.target.value),
    className: "wot-uinput",
    style: {
      width: '100%',
      boxSizing: 'border-box',
      background: 'transparent',
      border: 0,
      outline: 'none',
      borderRadius: 0,
      color: 'var(--wot-on-surface)',
      padding: 0,
      ...s,
      ...(focusAccent ? {
        borderBottomColor: 'var(--wot-primary)'
      } : null),
      ...style
    }
  }));
}
Object.assign(__ds_scope, { UnderlineInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/UnderlineInput.jsx", error: String((e && e.message) || e) }); }

// components/home/ActionCard.jsx
try { (() => {
function ActionCard({
  title,
  subtitle,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 16,
      background: '#fff',
      border: 0,
      padding: '16px 20px',
      cursor: 'pointer',
      textAlign: 'left',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 20,
      lineHeight: '22px',
      letterSpacing: -0.4,
      color: 'var(--wot-on-surface)'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 4,
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)'
    }
  }, subtitle) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--wot-primary)'
    }
  }, "\u2192"));
}
Object.assign(__ds_scope, { ActionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/home/ActionCard.jsx", error: String((e && e.message) || e) }); }

// components/home/SessionHistoryCard.jsx
try { (() => {
function SessionHistoryCard({
  dayName,
  dateStr,
  title,
  type,
  srpe,
  duration,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      background: 'none',
      border: 0,
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: 16,
      paddingRight: 16,
      borderRight: '1px solid var(--wot-border-solid)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      letterSpacing: 3,
      color: 'var(--wot-on-surface)'
    }
  }, dayName), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 2,
      fontSize: 9,
      color: 'var(--wot-muted-fg)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, dateStr)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      marginRight: 16,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 26,
      lineHeight: '28px',
      letterSpacing: -0.8,
      color: 'var(--wot-on-surface)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 4,
      fontSize: 9,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)'
    }
  }, type, " / sRPE: ", srpe)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 2,
      fontSize: 8,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)'
    }
  }, "Duration"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 14,
      color: 'var(--wot-on-surface)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, duration)));
}
Object.assign(__ds_scope, { SessionHistoryCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/home/SessionHistoryCard.jsx", error: String((e && e.message) || e) }); }

// components/home/WeekStrip.jsx
try { (() => {
function WeekStrip({
  loads = [],
  summary,
  label = 'This week'
}) {
  const lbl = {
    fontFamily: 'var(--font-body)',
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'var(--wot-muted-fg)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--wot-border-solid)',
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8,
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: lbl
  }, label), /*#__PURE__*/React.createElement("span", {
    style: lbl
  }, summary)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, loads.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: 8,
      borderRadius: 9999,
      background: l > 0 ? '#673F8A' : 'rgba(0,0,0,0.08)'
    }
  }))));
}
Object.assign(__ds_scope, { WeekStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/home/WeekStrip.jsx", error: String((e && e.message) || e) }); }

// components/insights/BalanceBars.jsx
try { (() => {
function BalanceBars({
  shares = [],
  title = 'Balance · last 4 weeks'
}) {
  if (!shares.length) return null;
  const t = {
    fontFamily: 'var(--font-body)',
    fontSize: 11
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 24,
      letterSpacing: -0.6,
      color: 'var(--wot-on-surface)'
    }
  }, title), shares.slice(0, 6).map(r => /*#__PURE__*/React.createElement("div", {
    key: r.region,
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 4,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...t,
      color: 'var(--wot-on-surface)'
    }
  }, r.region), /*#__PURE__*/React.createElement("span", {
    style: {
      ...t,
      color: 'var(--wot-muted-fg)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, r.sharePct, "%", r.usualPct != null ? ' · usual ' + r.usualPct + '%' : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      overflow: 'hidden',
      borderRadius: 9999,
      background: 'var(--wot-surface-container-low)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      borderRadius: 9999,
      background: 'var(--wot-primary)',
      width: r.sharePct + '%'
    }
  })))));
}
Object.assign(__ds_scope, { BalanceBars });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/insights/BalanceBars.jsx", error: String((e && e.message) || e) }); }

// components/insights/LoadTrendChart.jsx
try { (() => {
function LoadTrendChart({
  weeks = [],
  verdict,
  caption,
  baselineReady = true
}) {
  const max = Math.max(...weeks.map(w => w.load), 1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 24,
      letterSpacing: -0.6,
      color: 'var(--wot-on-surface)'
    }
  }, "Load \xB7 last ", weeks.length, " weeks"), baselineReady && verdict ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--wot-primary)'
    }
  }, verdict) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 6,
      height: 120
    }
  }, weeks.map(w => {
    const pct = w.load / max * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: w.weekStart,
      style: {
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }
    }, w.load === 0 ? null : /*#__PURE__*/React.createElement("div", {
      style: {
        width: '70%',
        height: Math.max(pct, 4) + '%',
        background: 'var(--wot-secondary)'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 8,
        color: 'var(--wot-muted-fg)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, w.weekStart.slice(5)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--wot-muted-fg)'
    }
  }, baselineReady ? caption : 'First weeks — building your baseline.'));
}
Object.assign(__ds_scope, { LoadTrendChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/insights/LoadTrendChart.jsx", error: String((e && e.message) || e) }); }

// components/insights/MetricRow.jsx
try { (() => {
function MetricRow({
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--wot-border-solid)',
      padding: '12px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 20,
      color: 'var(--wot-on-surface)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value));
}
Object.assign(__ds_scope, { MetricRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/insights/MetricRow.jsx", error: String((e && e.message) || e) }); }

// components/insights/SignalCard.jsx
try { (() => {
function SignalCard({
  title,
  body,
  details = [],
  positive = false,
  defaultExpanded = false
}) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      marginBottom: 12,
      borderRadius: 16,
      background: 'var(--wot-surface-container-low)',
      border: 0,
      padding: '16px 20px',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: 'var(--wot-on-surface)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: positive ? 'var(--wot-secondary)' : 'var(--wot-warning)'
    }
  }, positive ? '▲' : '⚠')), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 8,
      fontSize: 13,
      lineHeight: '20px',
      color: 'var(--wot-muted-fg)'
    }
  }, body), open && details.length ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 8,
      paddingTop: 8,
      borderTop: '1px solid var(--wot-border-solid)'
    }
  }, details.map(d => /*#__PURE__*/React.createElement("span", {
    key: d,
    style: {
      display: 'block',
      fontSize: 11,
      lineHeight: '20px',
      color: 'var(--wot-muted-fg)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, d))) : null);
}
Object.assign(__ds_scope, { SignalCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/insights/SignalCard.jsx", error: String((e && e.message) || e) }); }

// components/insights/StrengthProgression.jsx
try { (() => {
function Sparkline({
  values
}) {
  const max = Math.max(...values.filter(v => v !== null), 1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 2
    }
  }, values.map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: (v === null ? 2 : Math.max(v / max * 100, 4)) + '%',
      background: v === null ? 'rgba(0,0,0,0.08)' : '#395F94'
    }
  }))));
}
const ARROW = {
  up: '↗ climbing',
  down: '↘ dipping',
  flat: '→ flat'
};
function StrengthProgression({
  trends = []
}) {
  if (!trends.length) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 24,
      letterSpacing: -0.6,
      color: 'var(--wot-on-surface)'
    }
  }, "Strength progression"), trends.slice(0, 5).map(t => /*#__PURE__*/React.createElement("div", {
    key: t.name,
    style: {
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 14,
      color: 'var(--wot-on-surface)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, t.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)'
    }
  }, ARROW[t.direction])), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '45%'
    }
  }, /*#__PURE__*/React.createElement(Sparkline, {
    values: t.weeklyBest
  })))));
}
Object.assign(__ds_scope, { StrengthProgression });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/insights/StrengthProgression.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Sheet.jsx
try { (() => {
function Sheet({
  open,
  onClose,
  children,
  title
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("style", null, '@keyframes wot-sheet-in{from{transform:translateY(100%)}to{transform:none}}'), /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      flex: 1,
      background: 'rgba(0,0,0,0.3)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: '80%',
      overflowY: 'auto',
      borderRadius: '24px 24px 0 0',
      background: 'var(--wot-surface)',
      padding: '20px 24px 40px',
      animation: 'wot-sheet-in .28s cubic-bezier(.2,.8,.2,1)'
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20,
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 24,
      letterSpacing: -0.6,
      color: 'var(--wot-on-surface)'
    }
  }, title) : null, children));
}
function SheetField({
  label,
  children,
  inline = false
}) {
  const l = /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: inline ? 0 : 8,
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)'
    }
  }, label);
  return inline ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, l, children) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, l, children);
}
Object.assign(__ds_scope, { Sheet, SheetField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Sheet.jsx", error: String((e && e.message) || e) }); }

// components/workout/SetRow.jsx
try { (() => {
const FIELDS = {
  strength: [['weight', 'kg'], ['reps', 'reps']],
  cardio: [['distance', 'km'], ['duration', 'min']],
  flexibility: [['duration', 'sec'], ['weight', 'kg']]
};
const unit = {
  fontFamily: 'var(--font-body)',
  fontSize: 9,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: 'var(--wot-muted-fg)',
  textAlign: 'center',
  display: 'block'
};
const small = {
  fontFamily: 'var(--font-body)',
  fontSize: 10,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: 'var(--wot-muted-fg)',
  background: 'none',
  border: 0,
  padding: '4px 0',
  cursor: 'pointer'
};
function SetRow({
  setNumber,
  mode = 'strength',
  values = null,
  intensity = null,
  lastReference,
  copyable = false,
  onLog,
  onDelete
}) {
  const fields = FIELDS[mode].concat(mode === 'strength' && intensity ? [[intensity, intensity]] : []);
  const [draft, setDraft] = React.useState({});
  const [expanded, setExpanded] = React.useState(false);
  const num = /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--wot-muted-fg)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, setNumber);
  if (values) {
    return /*#__PURE__*/React.createElement("div", {
      onClick: () => setExpanded(v => !v),
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        cursor: 'pointer'
      }
    }, num, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8
      }
    }, fields.map(([k, l]) => {
      const isI = k === 'rir' || k === 'rpe';
      return /*#__PURE__*/React.createElement("div", {
        key: k,
        style: {
          minWidth: 40
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 300,
          fontSize: 22,
          lineHeight: '24px',
          color: 'var(--wot-on-surface)',
          fontVariantNumeric: 'tabular-nums'
        }
      }, values[k] ?? ''), /*#__PURE__*/React.createElement("span", {
        style: {
          ...unit,
          color: isI ? 'var(--wot-primary)' : unit.color
        }
      }, l, isI ? ' ⇄' : ''));
    })), expanded ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 12,
        fontSize: 12,
        letterSpacing: 2,
        color: 'var(--wot-primary)'
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        onDelete && onDelete();
      },
      style: {
        marginLeft: 8,
        padding: '0 4px',
        background: 'none',
        border: 0,
        fontSize: 14,
        color: 'var(--wot-muted-fg)',
        cursor: 'pointer'
      }
    }, "\u2715")) : null);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0'
    }
  }, num, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8
    }
  }, fields.map(([k, l]) => {
    const isI = k === 'rir' || k === 'rpe';
    const inp = /*#__PURE__*/React.createElement(__ds_scope.UnderlineInput, {
      key: k,
      size: "stat",
      placeholder: l,
      value: draft[k] ?? '',
      onChange: v => setDraft(p => ({
        ...p,
        [k]: v
      }))
    });
    return isI ? /*#__PURE__*/React.createElement("div", {
      key: k
    }, inp, /*#__PURE__*/React.createElement("span", {
      style: {
        ...unit,
        color: 'var(--wot-primary)'
      }
    }, l, " \u21C4")) : inp;
  }), mode === 'strength' && !intensity ? /*#__PURE__*/React.createElement("button", {
    style: {
      ...small,
      marginLeft: 4
    }
  }, "+ RIR") : null, lastReference ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 4,
      maxWidth: 120,
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'var(--wot-muted-fg)'
    }
  }, "last ", lastReference) : null, copyable ? /*#__PURE__*/React.createElement("button", {
    style: {
      ...small,
      marginLeft: 4
    }
  }, "Copy") : null, mode !== 'strength' ? /*#__PURE__*/React.createElement("button", {
    style: {
      ...small,
      marginLeft: 4
    }
  }, "\u25B6") : null, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onLog && onLog(draft);
      setDraft({});
    },
    style: {
      marginLeft: 8,
      width: 36,
      height: 36,
      borderRadius: 9999,
      border: 0,
      background: 'var(--wot-primary)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 16,
      cursor: 'pointer',
      flexShrink: 0
    }
  }, "\u2713")));
}
Object.assign(__ds_scope, { SetRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workout/SetRow.jsx", error: String((e && e.message) || e) }); }

// components/workout/ExerciseBlock.jsx
try { (() => {
function ExerciseBlock({
  name,
  bodyRegions = [],
  supersetGroup = null,
  mode: initialMode = 'strength',
  sets = [],
  intensity = null,
  lastReference,
  onLogSet,
  onRemove
}) {
  const [mode, setMode] = React.useState(initialMode);
  const [confirm, setConfirm] = React.useState(false);
  const meta = {
    fontFamily: 'var(--font-body)',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'var(--wot-muted-fg)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 4,
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 26,
      lineHeight: '28px',
      letterSpacing: -0.8,
      color: 'var(--wot-on-surface)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    size: "xs",
    selected: supersetGroup != null,
    label: supersetGroup != null ? 'SS' + supersetGroup : 'SS'
  }), bodyRegions.length ? /*#__PURE__*/React.createElement("span", {
    style: meta
  }, bodyRegions.join(' · ')) : null, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (confirm) {
        onRemove && onRemove();
      } else {
        setConfirm(true);
        setTimeout(() => setConfirm(false), 3000);
      }
    },
    style: {
      ...meta,
      background: 'none',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      color: confirm ? 'var(--wot-destructive)' : meta.color
    }
  }, confirm ? 'Tap again to remove' : 'Remove'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.ChipGroup, {
    size: "sm",
    options: ['strength', 'cardio', 'flexibility'],
    value: mode,
    onChange: setMode
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--wot-border-solid)'
    }
  }, sets.map((s, i) => /*#__PURE__*/React.createElement(__ds_scope.SetRow, {
    key: i,
    setNumber: i + 1,
    mode: mode,
    values: s,
    intensity: intensity
  })), /*#__PURE__*/React.createElement(__ds_scope.SetRow, {
    key: 'new-' + sets.length,
    setNumber: sets.length + 1,
    mode: mode,
    intensity: intensity,
    lastReference: mode === 'strength' ? lastReference : null,
    copyable: sets.length > 0,
    onLog: onLogSet
  })));
}
Object.assign(__ds_scope, { ExerciseBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workout/ExerciseBlock.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/App.jsx
try { (() => {
function App() {
  const {
    Screen,
    AppHeader,
    TabBar
  } = window.WOTDesignSystem_086a57;
  const d = window.WOT_DATA;
  const [route, setRoute] = React.useState(() => localStorage.getItem('wot-kit-route') || 'login');
  const [tab, setTab] = React.useState('today');
  const [sheet, setSheet] = React.useState(null);
  const [sessions, setSessions] = React.useState(d.sessions);
  const [weekLoads, setWeekLoads] = React.useState(d.weekLoads);
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [pain, setPain] = React.useState(null);
  const [active, setActive] = React.useState(null);
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  React.useEffect(() => {
    localStorage.setItem('wot-kit-route', route === 'workout' && !active ? 'tabs' : route);
  }, [route, active]);
  const go = r => setRoute(r);
  const app = {
    sessions,
    weekLoads,
    checkedIn,
    pain,
    active,
    now,
    weekCount: weekLoads.filter(x => x > 0).length,
    openSheet: setSheet,
    startWorkout: () => {
      if (!active) setActive({
        startedAt: Date.now() - 1000,
        title: 'Tuesday Strength',
        exercises: [],
        restAt: null
      });
      go('workout');
    },
    minimize: () => go('tabs'),
    back: () => go('tabs'),
    setTitle: t => setActive(a => ({
      ...a,
      title: t
    })),
    stopRest: () => setActive(a => ({
      ...a,
      restAt: null
    })),
    logSet: (i, dr) => setActive(a => ({
      ...a,
      restAt: Date.now(),
      exercises: a.exercises.map((ex, j) => j !== i ? ex : {
        ...ex,
        sets: [...ex.sets, {
          weight: dr.weight || dr.duration ? Number(dr.weight) || null : null,
          reps: Number(dr.reps) || null,
          distance: Number(dr.distance) || null,
          duration: Number(dr.duration) || null
        }]
      })
    })),
    removeExercise: i => setActive(a => ({
      ...a,
      exercises: a.exercises.filter((_, j) => j !== i)
    }))
  };
  const finish = ({
    srpe,
    type,
    minutes
  }) => {
    const h = Math.floor(minutes / 60),
      m = minutes % 60;
    setSessions(s => [{
      id: 'n' + Date.now(),
      dayName: 'WED',
      dateStr: '10.14',
      title: active.title || 'Workout',
      type,
      srpe,
      duration: String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00'
    }, ...s]);
    setWeekLoads(w => w.map((x, i) => i === 2 ? x + srpe * minutes : x));
    setActive(null);
    setSheet(null);
    setTab('today');
    go('tabs');
  };
  const T = {
    today: window.TodayScreen,
    history: window.HistoryScreen,
    insights: window.InsightsScreen
  }[tab];
  let body;
  if (route === 'login') body = /*#__PURE__*/React.createElement(window.LoginScreen, {
    onLogin: () => go('tabs')
  });else body = /*#__PURE__*/React.createElement(Screen, null, /*#__PURE__*/React.createElement(AppHeader, {
    logoSrc: "../../assets/wot-logo.svg",
    onSettings: () => go('settings')
  }), route === 'workout' && active ? /*#__PURE__*/React.createElement(window.WorkoutScreen, {
    app: app
  }) : route === 'settings' ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement(window.SettingsScreen, {
    app: app
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement(T, {
    app: app
  })), route === 'tabs' ? /*#__PURE__*/React.createElement(TabBar, {
    active: tab,
    onChange: setTab,
    activeSession: active ? {
      label: active.title || 'Workout',
      exercises: active.exercises.length,
      elapsed: window.fmtElapsed(now - active.startedAt)
    } : null,
    onOpenSession: () => go('workout')
  }) : null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 390,
      height: 844,
      borderRadius: 44,
      overflow: 'hidden',
      boxShadow: '0 0 0 10px #1a1a1a, 0 30px 60px rgba(0,0,0,0.25)',
      background: 'var(--wot-surface)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 14,
      background: 'var(--wot-surface)',
      position: 'relative',
      zIndex: 60
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      letterSpacing: 1
    }
  }, "\u25CF\u25CF\u25CF \u25AE")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 44,
      left: 0,
      right: 0,
      bottom: 0
    }
  }, body, /*#__PURE__*/React.createElement(window.CheckInSheet, {
    open: sheet === 'checkin',
    onClose: () => setSheet(null),
    onSave: () => {
      setCheckedIn(true);
      setSheet(null);
    }
  }), /*#__PURE__*/React.createElement(window.PainSheet, {
    open: sheet === 'pain',
    onClose: () => setSheet(null),
    onSave: p => {
      setPain(p);
      setSheet(null);
    }
  }), /*#__PURE__*/React.createElement(window.PickerSheet, {
    open: sheet === 'picker',
    onClose: () => setSheet(null),
    onPick: r => {
      setActive(a => ({
        ...a,
        exercises: [...a.exercises, {
          name: r.name,
          regions: r.regions,
          last: r.last,
          sets: []
        }]
      }));
      setSheet(null);
    }
  }), active ? /*#__PURE__*/React.createElement(window.FinishSheet, {
    open: sheet === 'finish',
    minutes: Math.max(1, Math.round((now - active.startedAt) / 60000)),
    onClose: () => setSheet(null),
    onPain: () => setSheet('pain'),
    onSave: finish
  }) : null));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/LoginScreen.jsx
try { (() => {
function LoginScreen({
  onLogin
}) {
  const {
    Screen,
    UnderlineInput,
    Button,
    TextLink
  } = window.WOTDesignSystem_086a57;
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const st = {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    letterSpacing: 1,
    color: 'var(--wot-muted-fg)'
  };
  return /*#__PURE__*/React.createElement(Screen, null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '48px 32px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/wot-logo.svg",
    style: {
      width: 180,
      height: 55,
      objectFit: 'contain'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: 52,
      lineHeight: '52px',
      letterSpacing: -2,
      textTransform: 'uppercase',
      marginBottom: 16
    }
  }, "Welcome", /*#__PURE__*/React.createElement("br", null), "to WOT!"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: st
  }, '>', " Train smart. Stay happy."), /*#__PURE__*/React.createElement("span", {
    style: st
  }, '>', " Let's log today's work."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(UnderlineInput, {
    size: "auth",
    label: "Email",
    placeholder: "you@example.com",
    value: email,
    onChange: setEmail
  }), /*#__PURE__*/React.createElement(UnderlineInput, {
    size: "auth",
    label: "Password",
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    value: pw,
    onChange: setPw
  }), /*#__PURE__*/React.createElement(Button, {
    trailing: "\u2192",
    onClick: onLogin,
    style: {
      marginTop: 8
    }
  }, "Log in")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 32,
      paddingTop: 24,
      borderTop: '0.5px solid rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement(TextLink, null, "New to WOT? Create account"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 32px',
      borderTop: '0.5px solid rgba(0,0,0,0.08)',
      fontSize: 9,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)'
    }
  }, "WOT v0.0.0-alpha"));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/Sheets.jsx
try { (() => {
const wotFieldLbl = {
  display: 'block',
  marginBottom: 8,
  fontSize: 10,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: 'var(--wot-muted-fg)'
};
function CheckInSheet({
  open,
  onClose,
  onSave
}) {
  const {
    Sheet,
    SheetField,
    RatingScale,
    Button,
    TextLink,
    UnderlineInput
  } = window.WOTDesignSystem_086a57;
  const [sleep, setSleep] = React.useState(null);
  const [q, setQ] = React.useState(null);
  const [fa, setFa] = React.useState(null);
  const [so, setSo] = React.useState(null);
  const [more, setMore] = React.useState(false);
  const rb = {
    width: 36,
    height: 36,
    borderRadius: 9999,
    border: 0,
    background: 'var(--wot-surface-container-low)',
    fontWeight: 500,
    fontSize: 16,
    cursor: 'pointer'
  };
  const fmt = sleep === null ? '—' : sleep >= 60 ? Math.floor(sleep / 60) + 'h ' + String(sleep % 60).padStart(2, '0') + 'm' : sleep + 'm';
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    title: "Quick check-in"
  }, /*#__PURE__*/React.createElement(SheetField, {
    inline: true,
    label: "Sleep duration"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: rb,
    onClick: () => setSleep(v => Math.max(0, (v ?? 0) - 15))
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 72,
      textAlign: 'center',
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 20,
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmt), /*#__PURE__*/React.createElement("button", {
    style: rb,
    onClick: () => setSleep(v => Math.min(960, (v ?? 420) + 15))
  }, "+"))), /*#__PURE__*/React.createElement(SheetField, {
    label: "Sleep quality"
  }, /*#__PURE__*/React.createElement(RatingScale, {
    value: q,
    onChange: setQ
  })), /*#__PURE__*/React.createElement(SheetField, {
    label: "Fatigue"
  }, /*#__PURE__*/React.createElement(RatingScale, {
    value: fa,
    onChange: setFa
  })), /*#__PURE__*/React.createElement(SheetField, {
    label: "Soreness"
  }, /*#__PURE__*/React.createElement(RatingScale, {
    value: so,
    onChange: setSo
  })), more ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(UnderlineInput, {
    placeholder: "Note (optional)"
  })) : /*#__PURE__*/React.createElement(TextLink, {
    style: {
      marginBottom: 20
    },
    onClick: () => setMore(true)
  }, "More \u25BE (stress \xB7 motivation \xB7 note)"), /*#__PURE__*/React.createElement(Button, {
    onClick: onSave
  }, "Save"));
}
function PainSheet({
  open,
  onClose,
  onSave
}) {
  const {
    Sheet,
    ChipGroup,
    RatingScale,
    Button,
    UnderlineInput
  } = window.WOTDesignSystem_086a57;
  const [r, setR] = React.useState(null);
  const [s, setS] = React.useState(null);
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    title: "Log pain"
  }, /*#__PURE__*/React.createElement("span", {
    style: wotFieldLbl
  }, "Body region"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(ChipGroup, {
    options: ['chest', 'legs', 'shoulders', 'knees', 'hips', 'back', 'elbow', 'ankle', 'other'],
    value: r,
    onChange: setR
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(UnderlineInput, {
    placeholder: "Or type a custom region\u2026"
  })), /*#__PURE__*/React.createElement("span", {
    style: wotFieldLbl
  }, "Severity"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(RatingScale, {
    value: s,
    onChange: setS,
    lowLabel: "annoying",
    highLabel: "can't train"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(UnderlineInput, {
    placeholder: "Note (optional)"
  })), /*#__PURE__*/React.createElement(Button, {
    disabled: !r || !s,
    onClick: () => onSave({
      region: r,
      severity: s
    })
  }, "Save"));
}
function FinishSheet({
  open,
  onClose,
  onSave,
  minutes,
  onPain
}) {
  const {
    Sheet,
    SheetField,
    RatingScale,
    ChipGroup,
    Button,
    UnderlineInput
  } = window.WOTDesignSystem_086a57;
  const [srpe, setSrpe] = React.useState(null);
  const [type, setType] = React.useState('strength');
  const [feel, setFeel] = React.useState(null);
  const [err, setErr] = React.useState(null);
  const [dur, setDur] = React.useState(String(minutes));
  React.useEffect(() => {
    if (open) {
      setDur(String(minutes));
      setSrpe(null);
      setErr(null);
    }
  }, [open]);
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose,
    title: "Finish workout"
  }, /*#__PURE__*/React.createElement(SheetField, {
    inline: true,
    label: "Duration"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(UnderlineInput, {
    size: "stat",
    value: dur,
    onChange: setDur,
    style: {
      fontSize: 24,
      width: 72
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--wot-muted-fg)'
    }
  }, "min"))), /*#__PURE__*/React.createElement(SheetField, {
    label: "How hard was it? (required)"
  }, /*#__PURE__*/React.createElement(RatingScale, {
    value: srpe,
    onChange: setSrpe,
    lowLabel: "very easy",
    highLabel: "max effort"
  })), /*#__PURE__*/React.createElement(SheetField, {
    label: "Type"
  }, /*#__PURE__*/React.createElement(ChipGroup, {
    options: ['strength', 'run', 'ride', 'mobility', 'other'],
    value: type,
    onChange: setType
  })), /*#__PURE__*/React.createElement(SheetField, {
    label: "Feeling (optional)"
  }, /*#__PURE__*/React.createElement(ChipGroup, {
    tone: "ink",
    options: [{
      key: 'good',
      label: 'Good'
    }, {
      key: 'tired',
      label: 'Tired'
    }, {
      key: 'pain',
      label: 'Something hurts'
    }],
    value: feel,
    onChange: k => {
      setFeel(k);
      if (k === 'pain') onPain();
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(UnderlineInput, {
    placeholder: "Note (optional)"
  })), err ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      fontSize: 12,
      color: 'var(--wot-destructive)'
    }
  }, err) : null, /*#__PURE__*/React.createElement(Button, {
    style: {
      opacity: srpe === null ? 0.4 : 1
    },
    onClick: () => srpe === null ? setErr('One more thing: tap a number under "How hard was it?" (1–10).') : onSave({
      srpe,
      type,
      minutes: parseInt(dur, 10) || 1
    })
  }, "Save workout"));
}
function PickerSheet({
  open,
  onClose,
  onPick
}) {
  const {
    Sheet
  } = window.WOTDesignSystem_086a57;
  const [q, setQ] = React.useState('');
  const rec = window.WOT_DATA.recents.filter(r => r.name.toLowerCase().includes(q.trim().toLowerCase()));
  const exact = rec.some(r => r.name.toLowerCase() === q.trim().toLowerCase());
  const row = {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    background: 'none',
    border: 0,
    cursor: 'pointer',
    fontFamily: 'var(--font-body)'
  };
  const pick = r => {
    setQ('');
    onPick(r);
  };
  return /*#__PURE__*/React.createElement(Sheet, {
    open: open,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 24,
      letterSpacing: -0.6
    }
  }, "Add exercise"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 0,
      fontSize: 14,
      color: 'var(--wot-muted-fg)',
      cursor: 'pointer'
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search or create\u2026",
    style: {
      width: '100%',
      boxSizing: 'border-box',
      marginBottom: 16,
      border: 0,
      borderBottom: '1px solid var(--wot-border-solid)',
      background: 'transparent',
      outline: 'none',
      paddingBottom: 4,
      fontFamily: 'var(--font-body)',
      fontSize: 17
    }
  }), rec.length ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8,
      fontSize: 9,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)'
    }
  }, "Recent"), rec.map(r => /*#__PURE__*/React.createElement("button", {
    key: r.name,
    style: row,
    onClick: () => pick(r)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 16,
      color: 'var(--wot-on-surface)'
    }
  }, r.name), r.last ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--wot-muted-fg)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, r.last) : null))) : null, q.trim() && !exact ? /*#__PURE__*/React.createElement("button", {
    style: {
      ...row,
      marginTop: 8
    },
    onClick: () => pick({
      name: q.trim(),
      regions: [],
      last: null
    })
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 16,
      color: 'var(--wot-primary)'
    }
  }, "Create \"", q.trim(), "\""), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--wot-primary)'
    }
  }, "+")) : null);
}
Object.assign(window, {
  CheckInSheet,
  PainSheet,
  FinishSheet,
  PickerSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/Sheets.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/TabScreens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const wotTitle = {
  marginBottom: 24,
  fontFamily: 'var(--font-heading)',
  fontWeight: 300,
  fontSize: 40,
  lineHeight: '38px',
  letterSpacing: -1.6,
  color: 'var(--wot-on-surface)'
};
const wotEyebrow = {
  marginBottom: 8,
  fontFamily: 'var(--font-body)',
  fontSize: 9,
  letterSpacing: 3,
  textTransform: 'uppercase',
  color: 'var(--wot-muted-fg)'
};
function TodayScreen({
  app
}) {
  const {
    ActionCard,
    Button,
    TextLink,
    WeekStrip,
    SessionHistoryCard
  } = window.WOTDesignSystem_086a57;
  const last = app.sessions[0];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: wotTitle
  }, "Today"), !app.checkedIn ? /*#__PURE__*/React.createElement(ActionCard, {
    title: "How's the body today?",
    subtitle: "Sleep \xB7 fatigue \xB7 soreness",
    onClick: () => app.openSheet('checkin'),
    style: {
      marginBottom: 24
    }
  }) : null, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: app.startWorkout,
    style: {
      marginBottom: 12
    }
  }, app.active ? 'Resume workout' : 'Start workout'), last ? /*#__PURE__*/React.createElement(TextLink, {
    size: 11,
    style: {
      marginBottom: 32
    },
    onClick: app.startWorkout
  }, "Repeat: ", last.title, " (", last.dayName.charAt(0) + last.dayName.slice(1).toLowerCase(), ")") : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement(WeekStrip, {
    loads: app.weekLoads,
    summary: app.weekCount + ' sessions · rising'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: wotEyebrow
  }, "Recent"), app.sessions.slice(0, 3).map(s => /*#__PURE__*/React.createElement(SessionHistoryCard, _extends({
    key: s.id
  }, s)))), /*#__PURE__*/React.createElement(TextLink, {
    onClick: () => app.openSheet('pain'),
    tracking: 3
  }, "+ Pain"), app.pain ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--wot-muted-fg)'
    }
  }, app.pain.region, " pain logged today (", app.pain.severity, "/10)") : null);
}
function HistoryScreen({
  app
}) {
  const {
    SessionHistoryCard
  } = window.WOTDesignSystem_086a57;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: wotTitle
  }, "History"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--wot-border-solid)'
    }
  }, app.sessions.map(s => /*#__PURE__*/React.createElement(SessionHistoryCard, _extends({
    key: s.id
  }, s)))));
}
function InsightsScreen({
  app
}) {
  const {
    LoadTrendChart,
    StrengthProgression,
    BalanceBars,
    SignalCard,
    MetricRow,
    TextLink
  } = window.WOTDesignSystem_086a57;
  const d = window.WOT_DATA;
  const [adv, setAdv] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: wotTitle
  }, "Insights"), /*#__PURE__*/React.createElement(LoadTrendChart, {
    weeks: d.weeks,
    verdict: "spiking",
    caption: "This week is 42% above your usual."
  }), /*#__PURE__*/React.createElement(StrengthProgression, {
    trends: d.trends
  }), /*#__PURE__*/React.createElement(BalanceBars, {
    shares: d.balance
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 24,
      letterSpacing: -0.6
    }
  }, "Needs attention"), d.signals.map(s => /*#__PURE__*/React.createElement(SignalCard, _extends({
    key: s.title
  }, s)))), /*#__PURE__*/React.createElement(TextLink, {
    onClick: () => setAdv(a => !a)
  }, "Advanced metrics \u25BE"), adv ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement(MetricRow, {
    label: "Weekly load",
    value: "1840"
  }), /*#__PURE__*/React.createElement(MetricRow, {
    label: "Monotony",
    value: "1.08"
  }), /*#__PURE__*/React.createElement(MetricRow, {
    label: "Strain",
    value: "1987"
  }), /*#__PURE__*/React.createElement(MetricRow, {
    label: "ACWR",
    value: "1.42"
  })) : null);
}
function SettingsScreen({
  app
}) {
  const {
    ChipGroup,
    TextLink
  } = window.WOTDesignSystem_086a57;
  const [str, setStr] = React.useState(['weight', 'reps']);
  const [car, setCar] = React.useState(['distance', 'duration']);
  const note = {
    fontSize: 11,
    lineHeight: '16px',
    color: 'var(--wot-muted-fg)',
    marginTop: 8
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      padding: '4px 24px 8px'
    }
  }, /*#__PURE__*/React.createElement(TextLink, {
    size: 11,
    tracking: 2,
    onClick: app.back
  }, "\u2039 Back"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 22,
      letterSpacing: -0.6
    }
  }, "Settings"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 48
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px 40px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24,
      fontSize: 13,
      lineHeight: '20px',
      color: 'var(--wot-muted-fg)'
    }
  }, "Choose which inputs appear when you log a set. Changes save automatically."), /*#__PURE__*/React.createElement("div", {
    style: wotEyebrow
  }, "Strength exercises"), /*#__PURE__*/React.createElement(ChipGroup, {
    multi: true,
    size: "sm",
    options: [{
      key: 'weight',
      label: 'Weight (kg)'
    }, {
      key: 'reps',
      label: 'Reps'
    }, {
      key: 'rir',
      label: 'RIR'
    }, {
      key: 'rpe',
      label: 'RPE'
    }],
    value: str,
    onChange: v => v.length && setStr(v)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...note,
      marginBottom: 24
    }
  }, "Add RIR or RPE to always show an effort input next to weight and reps."), /*#__PURE__*/React.createElement("div", {
    style: wotEyebrow
  }, "Cardio exercises"), /*#__PURE__*/React.createElement(ChipGroup, {
    multi: true,
    size: "sm",
    options: [{
      key: 'distance',
      label: 'Distance (km)'
    }, {
      key: 'duration',
      label: 'Duration (min)'
    }, {
      key: 'weight',
      label: 'Weight (kg)'
    }, {
      key: 'reps',
      label: 'Reps'
    }],
    value: car,
    onChange: v => v.length && setCar(v)
  }), /*#__PURE__*/React.createElement("div", {
    style: note
  }, "Combine as needed \u2014 distance \xD7 duration for runs, weight \xD7 duration for loaded carries, and so on.")));
}
Object.assign(window, {
  TodayScreen,
  HistoryScreen,
  InsightsScreen,
  SettingsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/TabScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/WorkoutScreen.jsx
try { (() => {
function fmtElapsed(ms) {
  const t = Math.max(0, Math.floor(ms / 1000)),
    h = Math.floor(t / 3600),
    m = Math.floor(t % 3600 / 60),
    s = t % 60;
  const mm = String(m).padStart(2, '0'),
    ss = String(s).padStart(2, '0');
  return h > 0 ? h + ':' + mm + ':' + ss : mm + ':' + ss;
}
function WorkoutScreen({
  app
}) {
  const {
    TextLink,
    UnderlineInput,
    ExerciseBlock
  } = window.WOTDesignSystem_086a57;
  const w = app.active;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 24px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(TextLink, {
    size: 11,
    tracking: 2,
    onClick: app.minimize
  }, "\u2193 Minimize"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 300,
      fontSize: 22,
      letterSpacing: -0.6,
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmtElapsed(app.now - w.startedAt)), /*#__PURE__*/React.createElement(TextLink, {
    size: 11,
    tracking: 2,
    tone: "primary",
    onClick: () => app.openSheet('finish')
  }, "Finish")), w.restAt ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--wot-muted-fg)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "Rest ", fmtElapsed(app.now - w.restAt)), /*#__PURE__*/React.createElement(TextLink, {
    size: 11,
    tracking: 2,
    tone: "primary",
    onClick: app.stopRest
  }, "Stop")) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(UnderlineInput, {
    size: "title",
    value: w.title,
    onChange: app.setTitle,
    placeholder: "Workout title"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '24px 24px 40px'
    }
  }, w.exercises.length === 0 ? /*#__PURE__*/React.createElement("button", {
    onClick: () => app.openSheet('picker'),
    style: {
      background: 'none',
      border: 0,
      padding: '4px 0',
      marginBottom: 16,
      fontSize: 13,
      lineHeight: '20px',
      color: 'var(--wot-muted-fg)',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)'
    }
  }, "Add your first exercise \u2192") : w.exercises.map((ex, i) => /*#__PURE__*/React.createElement(ExerciseBlock, {
    key: ex.name + i,
    name: ex.name,
    bodyRegions: ex.regions,
    sets: ex.sets,
    lastReference: ex.last,
    onLogSet: d => app.logSet(i, d),
    onRemove: () => app.removeExercise(i)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 0'
    }
  }, /*#__PURE__*/React.createElement(TextLink, {
    size: 11,
    tone: "primary",
    onClick: () => app.openSheet('picker')
  }, "+ Add exercise")), /*#__PURE__*/React.createElement(TextLink, {
    tracking: 3,
    onClick: () => app.openSheet('pain')
  }, "+ Pain")));
}
Object.assign(window, {
  WorkoutScreen,
  fmtElapsed
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/WorkoutScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/data.js
try { (() => {
window.WOT_DATA = {
  recents: [{
    name: 'Bench press',
    regions: ['chest', 'triceps'],
    last: '80 × 8'
  }, {
    name: 'Back squat',
    regions: ['legs'],
    last: '100 × 5'
  }, {
    name: 'Pull-up',
    regions: ['back'],
    last: '— × 8'
  }, {
    name: 'Romanian deadlift',
    regions: ['legs', 'back'],
    last: '90 × 8'
  }, {
    name: 'Plank',
    regions: ['core'],
    last: null
  }],
  sessions: [{
    id: 's1',
    dayName: 'SAT',
    dateStr: '10.11',
    title: 'Long run',
    type: 'run',
    srpe: 6,
    duration: '01:12:40'
  }, {
    id: 's2',
    dayName: 'THU',
    dateStr: '10.09',
    title: 'Thursday Strength',
    type: 'strength',
    srpe: 8,
    duration: '00:58:00'
  }, {
    id: 's3',
    dayName: 'TUE',
    dateStr: '10.07',
    title: 'Tuesday Strength',
    type: 'strength',
    srpe: 7,
    duration: '01:05:00'
  }, {
    id: 's4',
    dayName: 'SUN',
    dateStr: '10.05',
    title: 'Ride',
    type: 'ride',
    srpe: 5,
    duration: '01:40:00'
  }, {
    id: 's5',
    dayName: 'FRI',
    dateStr: '10.03',
    title: 'Mobility',
    type: 'mobility',
    srpe: 3,
    duration: '00:25:00'
  }],
  weekLoads: [310, 0, 464, 0, 0, 436, 0],
  weeks: ['2026-08-24', '2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12'].map((w, i) => ({
    weekStart: w,
    load: [900, 1100, 0, 1250, 1180, 1320, 1296, 1840][i]
  })),
  trends: [{
    name: 'Bench press',
    direction: 'up',
    weeklyBest: [72, 74, null, 76, 78, 80, 80, 82]
  }, {
    name: 'Back squat',
    direction: 'flat',
    weeklyBest: [100, 100, null, 102, 100, 100, 102, 100]
  }, {
    name: 'Pull-up',
    direction: 'down',
    weeklyBest: [12, 12, 11, null, 10, 10, 9, 9]
  }],
  balance: [{
    region: 'legs',
    sharePct: 38,
    usualPct: 30
  }, {
    region: 'chest',
    sharePct: 22,
    usualPct: 25
  }, {
    region: 'back',
    sharePct: 20,
    usualPct: 24
  }, {
    region: 'core',
    sharePct: 12,
    usualPct: 13
  }, {
    region: 'triceps',
    sharePct: 8,
    usualPct: 8
  }],
  signals: [{
    title: 'Load spike',
    body: 'This week is 42% above your 4-week average. Consider an easier next session.',
    details: ['This week: 1,840 AU', '4-week average: 1,296 AU', 'Spike threshold: +30%']
  }, {
    title: 'Recovery dip',
    body: 'Fatigue has been high for your last 3 logged days.',
    details: ['Fatigue 8 · 7 · 8 (last 3 logged days)']
  }, {
    positive: true,
    title: 'Progression',
    body: 'Bench press best is up 5 kg over the last 3 weeks.',
    details: ['Week of 09-21: 78 kg', 'Week of 10-12: 82 kg']
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/data.js", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/doc-page.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <doc-page> — paged-document shell for printable HTML.
 *
 * FIRST, decide how the document paginates — up front, before building:
 *
 * - FLOWING document (the default): write the whole document as one
 *   normal HTML flow inside <doc-page>; the browser's print engine
 *   splits it onto pages at export. Use for long-form documents with a
 *   single text flow: reports, memos, letters, essays.
 * - EXPLICIT pagination: a fixed set of pre-paginated pages, one
 *   <section class="page"> child per page. Use when the user asks for a
 *   specific page count, or the design implies one: a one-page resume, a
 *   two-sided flier, a poster, a certificate, a brochure — any richly
 *   laid-out document without a single text flow.
 * - If in doubt, ask the user as part of the build.
 *
 * PAGE SIZING — paper differs by country (letter vs A4), so the printed
 * sheet is not one fixed truth:
 * - FLOWING documents pin NO paper size: the print engine paginates
 *   onto the user's real paper, and the content reflows to it.
 * - EXPLICITLY PAGINATED documents print each page at a FIXED page box
 *   with overflow hidden — letter by default, size="a4" for a clearly
 *   metric user, the user's chosen paper when they export. Design each
 *   page to FILL that box, fitting letter and A4 alike without overlap.
 * - width/height pin an explicit fixed size, ONLY when the user gives
 *   one.
 * Never write your own @page rule or hard-code paper dimensions in the
 * content.
 *
 * Sizing modes (attributes):
 *   (none)                      — portrait: flowing docs use the user's
 *           paper; explicitly paginated pages use the named size box
 *           (letter unless size="a4")
 *   orientation="landscape"     — the same, landscape
 *   width / height              — explicit fixed size, ONLY when the user
 *           gives one (e.g. width="22in" height="30in" for a 22×30
 *           poster): the page IS the design's size, printed at true
 *           dimensions (or scaled onto the user's paper at print time).
 *           Any absolute CSS length: px/in/mm/cm/pt/pc.
 * The component announces the chosen mode to the host app at runtime (a
 * meta tag it injects), so the print path can inject the user's true
 * paper size.
 *
 * On screen the document renders on a desk background: a flowing
 * document as one tall scrolling sheet (Google Docs' pageless view);
 * explicitly paginated documents as one card per page.
 *
 * EXPLICIT pagination usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page>
 *     <section class="page" id="p1">…one page's design…</section>
 *     <section class="page" id="p2">…</section>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * How the page box works, concretely: each .page prints as ONE full-bleed
 * sheet at a FIXED physical size — letter by default (set size="a4" for
 * a clearly metric user), the user's chosen paper when they export —
 * with overflow hidden. Nothing scrolls and nothing reflows onto a next
 * sheet: content that misses the box is CLIPPED. Design each page to
 * FILL that page box, and to fit it — letter and A4 alike — without
 * overlap. Each page is a size container; don't size anything in
 * viewport units (they track the window, not the page), and never set
 * width or height on the .page section itself (the component sizes the
 * page box; an authored height like 100% is meaningless at print and is
 * overridden). The component owns the page box, the screen card chrome,
 * and the page breaks (never add your own break-before/after). Don't mix
 * .page sections with flowing content or header/footer slots in the same
 * document.
 *
 * FLOWING usage:
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 *   <doc-page margin="0.75in">
 *     <h1>Title</h1>
 *     <p>…body…</p>
 *   </doc-page>
 *   <script src="doc-page.js"></script>
 * There is no manual page-splitting — the browser's print engine
 * paginates at export. Standard break-hygiene rules (`break-inside:
 * avoid` on figures, code blocks, images and table rows; `orphans/
 * widows: 3`) are applied so paragraphs and groups split cleanly. On
 * screen and at print, headings default to `text-wrap: balance` and
 * body text to `text-wrap: pretty`; the defaults have zero specificity,
 * so any text-wrap you declare wins.
 *
 * Other attributes:
 *   size    — letter | a4 | legal (default letter). Flowing documents:
 *           preview proportion only — it does NOT pin their printed
 *           paper (the print dialog's paper governs); leave it alone
 *           there. Explicitly paginated documents: it sets the page box
 *           the cards and the pinned @page share (the export dialog's
 *           choice overrides both at print) — set size="a4" for a
 *           clearly metric user. Scaled-fit: names the sheet the fit is
 *           computed against, same a4-for-metric-users advice.
 *   content-width / content-height — the design's own fixed dimensions
 *           (CSS lengths), for scaling a fixed-size design ONTO the
 *           named sheet: content lays out at exactly this size, and the
 *           component scales it to fit that sheet's printable area
 *           (centered horizontally, top-aligned; the export dialog
 *           re-fits to the user's actual paper choice where available).
 *           Both must be set; they do not change the page box. For pages
 *           WITHOUT running header/footer slots.
 *   margin  — printable inset on every page of a FLOWING document
 *           (default 0.75in); margin="0" makes pages full-bleed.
 *           Explicitly paginated pages are always full-bleed.
 *
 * Running header/footer (flowing documents only): give an element
 * `slot="header"` or `slot="footer"` and it repeats on every printed
 * page via `position: fixed`. To keep body text from sliding under it,
 * the component prints inside a single-cell table whose <thead>/<tfoot>
 * are spacers sized to the header/footer height — browsers repeat
 * thead/tfoot on every page, so each sheet's content starts below the
 * header and ends above the footer. On screen the header/footer render
 * once at the top/bottom of the sheet.
 *
 * At print the component injects `@page { margin: 0 }` (which leaves
 * Chrome no margin box to draw its date/URL/page-count header in) and
 * moves the visual margin onto the sheet's own padding. It also marks
 * the document as owning its print CSS (a
 * `meta[name="omelette-owns-print"]` it injects at runtime), so the
 * PDF export never injects page-geometry CSS of its own on top.
 *
 * Print best practices for the content you author:
 * - Multi-column text: use CSS columns (`column-count` +
 *   `column-gap`), never side-by-side flex/grid columns — only real
 *   CSS columns flow and break across pages. `column-span: all` lets
 *   a heading span the columns; `hyphens: auto` (needs `lang` on
 *   the html element) keeps narrow columns readable.
 * - Page breaks in flowing documents: `break-before: page` on an
 *   element that must start a new page (a chapter, an appendix). Add
 *   your own kept-together blocks (callouts, stat tiles, cards) to a
 *   `break-inside: avoid` rule, and keep each one shorter than a page.
 * - Extend `orphans: 3; widows: 3` to any custom text blocks you add
 *   (p and li are covered by default).
 * - Give long tables a <thead> — browsers repeat it on every printed
 *   page.
 * - No `position: fixed`/`sticky` and no viewport units in content:
 *   fixed elements stamp every printed page (running headers/footers go
 *   in the component's slots) and `100vh` mis-sizes at print.
 *
 * Author content as static HTML so the user can click-to-edit any text
 * directly. Do not set width/padding/background on the document body —
 * the component owns the sheet box.
 */
/* END USAGE */

(() => {
  const PAPER = {
    letter: ['8.5in', '11in'],
    a4: ['210mm', '297mm'],
    legal: ['8.5in', '14in']
  };
  const CSS_LENGTH = /^\d+(\.\d+)?(px|in|mm|cm|pt|pc)$/;
  // Unitless "0" is a valid CSS length and the natural way to write
  // margin="0"; normalise it to 0px so max()/calc() (which reject a bare
  // number) keep working.
  const safeLen = (v, fb) => {
    v = (v || '').trim();
    return v === '0' ? '0px' : CSS_LENGTH.test(v) ? v : fb;
  };
  // WebKit (Safari and every iOS browser shell) never repeats a table's
  // thead/tfoot on printed pages (WebKit bug 17205), so the spacer-borne
  // vertical margins of a FLOWING document reach only the first page
  // there. Engine check, not browser check: vendor is 'Apple Computer,
  // Inc.' exactly for WebKit and 'Google Inc.' for Blink.
  const WK_PRINT = /apple/i.test(navigator.vendor || '');
  // CSS length → px number (CSS absolute units are exact: 1in = 96px).
  // Returns NaN for anything safeLen would reject — callers gate on it.
  const PX_PER = {
    px: 1,
    in: 96,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
    pt: 96 / 72,
    pc: 16
  };
  const toPx = v => {
    const m = /^(\d+(?:\.\d+)?)(px|in|mm|cm|pt|pc)$/.exec((v || '').trim());
    return m ? parseFloat(m[1]) * PX_PER[m[2]] : NaN;
  };
  const stylesheet = `
    :host {
      position: relative;
      display: block;
      /* When the viewport is narrower than the page, grow to wrap the
       * sheet (plus this padding) instead of staying viewport-width, so
       * the desk background and right margin reach the sheet's far edge
       * in the horizontal scroll. */
      min-width: max-content;
      min-height: 100vh;
      background: #f5f5f4;
      padding: 48px 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      --doc-page-w: 8.5in;
      --doc-page-h: 11in;
      --doc-page-margin: 0.75in;
      --doc-hdr-h: 0px;
      --doc-ftr-h: 0px;
      --doc-hdr-pad: 0px;
      --doc-ftr-pad: 0px;
    }
    .sheet {
      width: var(--doc-page-w);
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 2px 10px rgba(20, 20, 19, 0.12);
      border-radius: 7px;
      box-sizing: border-box;
      padding: var(--doc-page-margin);
    }
    .frame { width: 100%; border-collapse: collapse; }
    /* Scaled-fit mode (content-width/content-height): the inner .fit box
     * lays the content out at its authored fixed size and scales it onto
     * the printable area; .fit-box reserves the scaled footprint in flow
     * (transforms don't affect layout) and centers it. Without the mode,
     * both divs are unstyled block pass-throughs. */
    /* Explicit pagination: direct .page children are the pages. The sheet
     * becomes a transparent stack and each page carries the card look on
     * screen; at print each page is exactly one full-bleed sheet. The
     * ::slotted defaults are deliberately weak (document CSS wins), so
     * authored page styling can override any of this. */
    .sheet.paginated {
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      padding: 0;
    }
    .paginated ::slotted(.page) {
      position: relative;
      display: block;
      width: 100%;
      aspect-ratio: var(--doc-page-ar);
      container-type: size;
      overflow: hidden;
      box-sizing: border-box;
      background: #fff;
      border-radius: 7px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      break-inside: avoid;
    }
    .paginated ::slotted(.page:not(:first-child)) { margin-top: 1rem; }
    @media print {
      .sheet.paginated { padding: 0; }
      /* The flowing-document vertical inset lives on the repeating
       * thead/tfoot spacers, not the sheet padding — they must go too,
       * or each full-sheet .page is pushed ~margin down and spills onto
       * a second sheet. Paginated pages are full-bleed by definition
       * (content owns its insets). */
      .sheet.paginated .hdr-space,
      .sheet.paginated .ftr-space { height: 0; }
      .paginated ::slotted(.page) {
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        /* Physical page-box sizing, no viewport units: Safari resolves
         * 100vh against the window, not the page box, so a vh-sized card
         * paginates wrong there. --doc-page-w/h are the named size by
         * default and are overridden to the user's chosen paper by the
         * export path, so every card is exactly one sheet either way.
         * Width + height (same source values as @page size) rather than
         * width + aspect-ratio: the ratio is a 6-decimal rounding of the
         * same division, and a few millionths of overflow would spill a
         * blank sheet after every page. The screen-only aspect-ratio
         * (preview proportions) must not leak into print. cqh typography
         * tracks the same box.
         *
         * Every declaration is !important: per CSS Scoping, unimportant
         * shadow ::slotted rules LOSE to the document context, so a page
         * section's authored inline style would silently beat this print
         * geometry. A model-authored height:100% did exactly that — the
         * percentage resolves as auto in the all-auto print ancestry, the
         * base rule's size containment turns auto into ZERO, and
         * overflow:hidden then paints nothing: a blank PDF with perfect
         * page boxes. At print the component's geometry is the design's
         * whole contract, so it must win over any authored sizing. */
        aspect-ratio: auto !important;
        width: var(--doc-page-w) !important;
        height: var(--doc-page-h) !important;
        overflow: hidden !important;
      }
      .paginated ::slotted(.page:not(:first-child)) {
        break-before: page !important;
        margin-top: 0 !important;
      }
    }
    .fit-mode .fit-box {
      width: calc(var(--doc-fit-w) * var(--doc-fit-scale));
      height: calc(var(--doc-fit-h) * var(--doc-fit-scale));
      margin: 0 auto;
      break-inside: avoid;
    }
    /* Monolithic at print: Blink slices a transform-scaled child at
     * fragmentainer boundaries mapped in UNSCALED layout coordinates
     * (transforms are paint-time), so the .fit box (authored size, e.g.
     * 1400x990) gets cut at the page's free block space and spills onto
     * a second sheet even though its SCALED footprint fits the page by
     * construction. overflow:hidden makes .fit-box a scroll container —
     * monolithic under fragmentation (css-break-3) — so the scaled
     * content prints atomically on one sheet. No clipping for content
     * within the authored box: .fit-box is calc-sized to exactly the
     * scaled footprint. (Content that bleeds past content-width/height
     * is clipped at the footprint — fit mode's contract; it previously
     * painted beyond it at print.) Print-only, so the screen rendering
     * keeps visible overflow for editor affordances.
     * The export path injects the same rule into frozen copies
     * (print-eval.ts om-print-fit-contain). The .fit-mode scope is
     * load-bearing: .fit-box wraps slotted content in EVERY mode, and an
     * unscoped overflow:hidden would make whole flowing documents
     * monolithic (one truncated sheet). overflow:hidden, never clip —
     * clip is not a scroll container, so not monolithic. */
    @media print {
      .fit-mode .fit-box { overflow: hidden; }
    }
    .fit-mode .fit {
      width: var(--doc-fit-w);
      height: var(--doc-fit-h);
      transform: scale(var(--doc-fit-scale));
      transform-origin: top left;
    }
    .frame td, .frame th { padding: 0; text-align: left; font-weight: inherit; }
    .hdr-space { height: var(--doc-hdr-h); }
    .ftr-space { height: var(--doc-ftr-h); }
    ::slotted([slot="header"]),
    ::slotted([slot="footer"]) { display: block; box-sizing: border-box; }
    @media print {
      :host { background: none; padding: 0; min-width: 0; min-height: 0; }
      .sheet {
        width: auto; margin: 0; box-shadow: none; border-radius: 0;
        padding: 0 var(--doc-page-margin);
      }
      /* The thead/tfoot spacers repeat on every page, so they carry the
       * vertical page margin (which the sheet's own padding cannot, since
       * that padding is consumed once on the first/last page). The running
       * header/footer are fixed inside that band. */
      /* The 0.35in is breathing room between a running header/footer and
       * the body; without one the spacer is exactly the page margin, so a
       * margin="0" full-bleed document gets truly full-bleed pages. */
      .hdr-space { height: max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))); }
      .ftr-space { height: max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))); }
      /* WebKit flowing documents: @page carries the vertical margin (see
       * _syncPrintPageRule), so the spacers keep only whatever a running
       * header/footer needs BEYOND it — page 1 would otherwise double its
       * top inset. Paginated sheets already zero their spacers above. */
      .sheet.wk-print:not(.paginated) .hdr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-hdr-h) + var(--doc-hdr-pad))) - var(--doc-page-margin))); }
      .sheet.wk-print:not(.paginated) .ftr-space { height: max(0px, calc(max(var(--doc-page-margin), calc(var(--doc-ftr-h) + var(--doc-ftr-pad))) - var(--doc-page-margin))); }
      ::slotted([slot="header"]) {
        position: fixed; top: 0; left: 0; right: 0; margin: 0;
        padding: calc(var(--doc-page-margin) * 0.45) var(--doc-page-margin) 0;
      }
      ::slotted([slot="footer"]) {
        position: fixed; bottom: 0; left: 0; right: 0; margin: 0;
        padding: 0 var(--doc-page-margin) calc(var(--doc-page-margin) * 0.45);
      }
    }
  `;
  class DocPage extends HTMLElement {
    static get observedAttributes() {
      return ['size', 'width', 'height', 'margin', 'orientation', 'content-width', 'content-height'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._mo = typeof MutationObserver === 'function' ? new MutationObserver(() => this._scheduleMeasure()) : null;
    }

    /** The named paper's [w, h], swapped when orientation="landscape".
     *  Only the named size swaps — explicit width/height are exact values
     *  the author already oriented. */
    _paperSize() {
      const named = PAPER[(this.getAttribute('size') || '').toLowerCase()] || PAPER.letter;
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? [named[1], named[0]] : named;
    }
    get pageWidth() {
      return safeLen(this.getAttribute('width'), this._paperSize()[0]);
    }
    get pageHeight() {
      return safeLen(this.getAttribute('height'), this._paperSize()[1]);
    }
    get pageMargin() {
      return safeLen(this.getAttribute('margin'), '0.75in');
    }

    /** Scaled-fit mode's content box [w, h] as CSS lengths, or null when
     *  the mode is off (either attribute missing/invalid/zero — a partial
     *  declaration falls back to normal flow rather than guessing). */
    _contentFit() {
      const w = safeLen(this.getAttribute('content-width'), null);
      const h = safeLen(this.getAttribute('content-height'), null);
      if (!w || !h) return null;
      const wPx = toPx(w),
        hPx = toPx(h);
      return wPx > 0 && hPx > 0 ? [w, h, wPx, hPx] : null;
    }
    connectedCallback() {
      if (!this._sheet) this._render();
      this._syncSize();
      this._syncPrintPageRule();
      this._ensureTextWrapDefaults();
      this._ensureOwnsPrintMeta();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      if (this._mo) this._mo.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      this._onResize = () => this._scheduleMeasure();
      window.addEventListener('resize', this._onResize);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this._scheduleMeasure());
      }
      this._scheduleMeasure();
    }
    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      if (this._mo) this._mo.disconnect();
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = null;
      }
      // Drop the head rules when the last doc-page leaves, so a deleted
      // document's @page geometry and text-wrap defaults can't apply to
      // whatever replaces it.
      const survivor = document.querySelector('doc-page');
      if (!survivor) {
        ['doc-page-print', 'doc-page-text-wrap', 'doc-page-owns-print', 'doc-page-fixed-size', 'doc-page-print-sizing'].forEach(id => {
          const tag = document.getElementById(id);
          if (tag) tag.remove();
        });
        // A live deck-stage deferred its own print-sizing meta to ours —
        // hand the page-global meta over so the deck isn't left unmarked.
        const deck = document.querySelector('deck-stage');
        if (deck && typeof deck._ensurePrintSizingMeta === 'function') {
          deck._ensurePrintSizingMeta();
        }
      } else {
        // A departed owner hands each page-global meta to whatever
        // doc-page remains (or it's removed).
        if (typeof survivor._syncFixedSizeMeta === 'function') {
          survivor._syncFixedSizeMeta();
        }
        if (typeof survivor._syncPrintSizingMeta === 'function') {
          survivor._syncPrintSizingMeta();
        }
      }
    }
    attributeChangedCallback() {
      if (!this._sheet) return;
      this._syncSize();
      this._syncPrintPageRule();
      this._syncFixedSizeMeta();
      this._syncPrintSizingMeta();
      this._scheduleMeasure();
    }
    _render() {
      this._root.innerHTML = `
        <style>${stylesheet}</style>
        <style id="vars"></style>
        <div class="sheet" data-screen-label="Document">
          <table class="frame" role="presentation">
            <thead><tr><th><div class="hdr-space"><slot name="header"></slot></div></th></tr></thead>
            <tbody><tr><td class="body"><div class="fit-box"><div class="fit"><slot></slot></div></div></td></tr></tbody>
            <tfoot><tr><td><div class="ftr-space"><slot name="footer"></slot></div></td></tr></tfoot>
          </table>
        </div>`;
      this._sheet = this._root.querySelector('.sheet');
      this._vars = this._root.getElementById('vars');
    }

    /** Runtime sizing lives in a shadow <style> :host rule, never on the
     *  light-DOM host element, so serialize-persist can't write it back. */
    _syncSize(hdrH, ftrH) {
      // Scaled-fit mode: content at its authored size, scaled onto the
      // printable area (page minus margins on both axes). The factor is a
      // plain number var so calc(length * number) stays valid; 4 decimals
      // keeps the shadow style stable across re-measures. Upscaling is
      // allowed — print transforms are vector, so text and CSS stay crisp
      // (raster images soften, which the catalog bullet warns about).
      const fit = this._contentFit();
      let fitVars = '';
      if (fit) {
        const marginPx = toPx(this.pageMargin) || 0;
        const availW = toPx(this.pageWidth) - 2 * marginPx;
        const availH = toPx(this.pageHeight) - 2 * marginPx;
        const scale = Math.min(availW / fit[2], availH / fit[3]);
        if (scale > 0 && Number.isFinite(scale)) {
          fitVars = '--doc-fit-w:' + fit[0] + ';' + '--doc-fit-h:' + fit[1] + ';' + '--doc-fit-scale:' + scale.toFixed(4) + ';';
        }
      }
      this._sheet.classList.toggle('fit-mode', !!fitVars);
      // Numeric w/h ratio for the paginated page cards' aspect-ratio —
      // aspect-ratio takes a number, not a length ratio, so compute it
      // here (CSS length division isn't portable). 6 decimals keeps the
      // shadow style stable across re-syncs.
      const arW = toPx(this.pageWidth);
      const arH = toPx(this.pageHeight);
      const ar = arW > 0 && arH > 0 ? (arW / arH).toFixed(6) : '0.772727';
      this._vars.textContent = ':host{' + fitVars + '--doc-page-ar:' + ar + ';' + '--doc-page-w:' + this.pageWidth + ';' + '--doc-page-h:' + this.pageHeight + ';' + '--doc-page-margin:' + this.pageMargin + ';' + '--doc-hdr-h:' + (hdrH || 0) + 'px;' + '--doc-ftr-h:' + (ftrH || 0) + 'px;' + '--doc-hdr-pad:' + (hdrH ? '0.35in' : '0px') + ';' + '--doc-ftr-pad:' + (ftrH ? '0.35in' : '0px') + '}';
    }

    /** @page is a no-op inside shadow DOM, so the rule lives in <head>.
     *  Re-appended on every sync so it stays last in source order — the
     *  @page cascade is source-order per descriptor, so this rule wins
     *  over any other @page rule in the document.
     *
     *  The @page SIZE is pinned where the page box IS part of the design:
     *  explicit-fixed-size mode (width + height authored), scaled-fit
     *  mode (the named sheet the fit targets), and explicit pagination
     *  (the named size the cards share — so card and sheet agree on
     *  every print path, and the export path's chosen paper overrides
     *  BOTH with one later rule). For FLOWING documents no paper size is
     *  emitted at all — the true size comes from the user's preference,
     *  injected by the export path or chosen in the print dialog — so a
     *  flowing document never fights the paper it lands on.
     *  margin: 0 is emitted in every mode: it leaves Chrome no margin box
     *  to draw its date/URL/page-count header in, and the visual margin
     *  lives on the sheet's own padding. */
    _syncPrintPageRule() {
      const id = 'doc-page-print';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
      }
      document.head.appendChild(tag);
      // Three print-geometry regimes:
      // - true-size: the page IS the design — pin its exact size.
      // - scaled-fit (content-width/height): the fit factor is computed
      //   against the NAMED paper's printable area, so that paper must
      //   stay pinned or the scaled content overflows a smaller sheet
      //   (the export path re-fits and re-pins at print time on top).
      // - default modes: no paper size — but landscape still needs the
      //   paper-agnostic 'size: landscape' keyword, because the size
      //   descriptor is what carries orientation; without it a landscape
      //   document prints portrait whenever nothing injects a size.
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      // Explicit pagination pins the page box to the SAME values that
      // size the cards (the named size by default, the export path's
      // chosen paper when its later rule overrides both) — card and
      // sheet agree on every print path, and a mismatched real paper
      // shrinks-to-fit in the dialog instead of clipping a Letter card
      // on A4. Declared before the paginated read below so both derive
      // from one check.
      const paginatedNow = this.querySelector(':scope > .page') !== null;
      const sizeDescriptor = this._trueSizePx() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : this._contentFit() ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : paginatedNow ? 'size: ' + this.pageWidth + ' ' + this.pageHeight + '; ' : landscape ? 'size: landscape; ' : '';
      // WebKit never repeats the thead/tfoot spacers that carry a flowing
      // document's vertical page margins (see WK_PRINT above), so pages
      // after the first print edge-to-edge there. Carry the VERTICAL
      // margins on @page for WebKit instead, and the shadow print CSS
      // trims the first-page spacers by the same amount (.sheet.wk-print
      // rules). Horizontal inset stays on the sheet's own padding in
      // every engine. Blink keeps margin: 0 (a nonzero margin there
      // re-opens the box Chrome draws its header furniture in). One cost,
      // learned in testing: Safari's own date/URL headers are a USER
      // dialog setting ("Print headers and footers") that renders in the
      // margin area when room exists — margin: 0 only suppressed it by
      // leaving no room, and no CSS controls it. The export dialog's
      // Safari guide teaches turning the setting off for flowing
      // documents. Explicitly paginated and fixed-size documents keep
      // margin: 0 everywhere: their pages ARE the sheet.
      const wkFlowing = WK_PRINT && !paginatedNow && !this._trueSizePx() && !this._contentFit();
      const marginDescriptor = wkFlowing ? 'margin: ' + this.pageMargin + ' 0; ' : 'margin: 0; ';
      // Shadow-internal marker (never serialized), kept in lockstep with
      // the @page decision above: the print CSS trims the first-page
      // spacers ONLY while @page actually carries the margins — a
      // true-size or scaled-fit sheet keeps margin: 0 and must keep its
      // spacers too. Re-synced here so attribute changes and pagination
      // flips move both together.
      if (this._sheet) this._sheet.classList.toggle('wk-print', wkFlowing);
      tag.textContent = '@page { ' + sizeDescriptor + marginDescriptor + '} ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; height: auto !important; overflow: visible !important; } ' + 'h1,h2,h3,h4,h5,h6 { break-after: avoid; } ' + 'figure,pre,blockquote,img,svg,tr { break-inside: avoid; } ' + 'p,li { orphans: 3; widows: 3; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; ' + 'backdrop-filter: none !important; -webkit-backdrop-filter: none !important; } ' + '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }

    /** Typographic defaults for document text: balance headings, avoid
     *  widowed/orphaned words in body copy (browsers without text-wrap
     *  support drop the declarations). Zero-specificity via :where() so
     *  any text-wrap authored on those elements wins; document-level so the
     *  rules reach the slotted (light DOM) content — shadow styles can't.
     *  data-omelette-injected marks the tag for the host editor to strip
     *  at serialize, so it is never written back as authored source. */
    _ensureTextWrapDefaults() {
      if (document.getElementById('doc-page-text-wrap')) return;
      const tag = document.createElement('style');
      tag.id = 'doc-page-text-wrap';
      tag.setAttribute('data-omelette-injected', '');
      tag.textContent = ':where(h1,h2,h3,h4,h5,h6){text-wrap:balance}' + ':where(p,li,blockquote,figcaption){text-wrap:pretty}';
      document.head.appendChild(tag);
    }

    /** Declares that this document owns its print CSS. The instant-PDF
     *  export checks for the meta by NAME PRESENCE alone (content is
     *  ignored) and skips its automatic print-CSS injections, so the
     *  component's @page geometry is never overridden by a heuristic.
     *  data-omelette-injected keeps it out of serialized source. */
    _ensureOwnsPrintMeta() {
      if (document.getElementById('doc-page-owns-print')) return;
      const tag = document.createElement('meta');
      tag.id = 'doc-page-owns-print';
      tag.name = 'omelette-owns-print';
      tag.content = 'true';
      tag.setAttribute('data-omelette-injected', '');
      document.head.appendChild(tag);
    }

    /** This page's valid true-size page box (explicit width AND height)
     *  as [w, h] px ints, or null when the mode is off. */
    _trueSizePx() {
      if (!safeLen(this.getAttribute('width'), null) || !safeLen(this.getAttribute('height'), null)) return null;
      const w = Math.round(toPx(this.pageWidth));
      const h = Math.round(toPx(this.pageHeight));
      return w > 0 && h > 0 ? [w, h] : null;
    }

    /** True-size pages (explicit width AND height) also declare the page
     *  box as the preview size: the in-app preview reads
     *  meta[name="omelette-fixed-size"] (content "W,H" in px ints) and
     *  scales the sheet into view — without it an 18in poster previews at
     *  true size with scrollbars. Never overrides an author-set meta
     *  (only the component's own id is managed). The meta is page-global
     *  while doc-page instances are not, so every sync recomputes the
     *  page-wide owner — the first connected true-size doc-page — and a
     *  non-true-size sibling's sync can never delete the owner's meta.
     *  Removed when no true-size page remains (the owner's disconnect
     *  re-syncs via any survivor) or when an author-set meta exists. */
    _syncFixedSizeMeta() {
      const id = 'doc-page-fixed-size';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-fixed-size"]:not([data-omelette-injected])');
      // The page-wide owner, not this instance: an upgraded true-size page
      // anywhere in the document keeps the meta alive and sized.
      let box = null;
      for (const el of document.querySelectorAll('doc-page')) {
        box = typeof el._trueSizePx === 'function' ? el._trueSizePx() : null;
        if (box) break;
      }
      if (!box || authored) {
        if (own) own.remove();
        return;
      }
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-fixed-size';
      tag.content = box[0] + ',' + box[1];
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }

    /** This page's print-sizing mode: 'fixed' when an explicit width AND
     *  height are authored (the page is the design's own size), else the
     *  default paper in the authored orientation. */
    _printSizingMode() {
      if (this._trueSizePx()) return 'fixed';
      const landscape = (this.getAttribute('orientation') || '').trim().toLowerCase() === 'landscape';
      return landscape ? 'default-landscape' : 'default-portrait';
    }

    /** Announces the print-sizing mode to the host app:
     *  meta[name="omelette-print-sizing"] with content 'default-portrait',
     *  'default-landscape', or 'fixed' (fixed pages also carry the
     *  omelette-fixed-size meta with the page box in px). The export path
     *  probes it to decide what true paper size to inject at print time —
     *  in the default modes the component emits no paper size of its own.
     *  Same page-global ownership rules as the fixed-size meta above:
     *  first connected doc-page owns it, an authored meta is never
     *  overridden, removed when no doc-page remains. */
    _syncPrintSizingMeta() {
      const id = 'doc-page-print-sizing';
      const own = document.getElementById(id);
      const authored = document.querySelector('meta[name="omelette-print-sizing"]:not([data-omelette-injected])');
      // A fixed page wins outright (mirroring the fixed-size loop above,
      // so the two metas can never contradict each other in a mixed
      // multi-page document); otherwise the first page's mode holds.
      let mode = null;
      for (const el of document.querySelectorAll('doc-page')) {
        if (typeof el._printSizingMode !== 'function') continue;
        const m = el._printSizingMode();
        if (m === 'fixed') {
          mode = m;
          break;
        }
        if (mode === null) mode = m;
      }
      if (!mode || authored) {
        if (own) own.remove();
        return;
      }
      // A deck-stage that connected first injected its own meta and
      // defers to any existing one — take it over, or the document ends
      // up with two conflicting injected metas (a doc-page page is the
      // document; the deck re-ensures its meta if every doc-page leaves).
      const deckMeta = document.getElementById('deck-stage-print-sizing');
      if (deckMeta) deckMeta.remove();
      const tag = own || document.createElement('meta');
      tag.id = id;
      tag.name = 'omelette-print-sizing';
      tag.content = mode;
      tag.setAttribute('data-omelette-injected', '');
      if (!own) document.head.appendChild(tag);
    }
    _scheduleMeasure() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this._measure();
      });
    }

    /** Slot heights feed the print spacers (--doc-hdr-h / --doc-ftr-h), so
     *  they re-measure on content mutation, resize, and font load. The
     *  same pass detects explicit pagination (direct .page children) and
     *  toggles the sheet between the flowing-document card and the
     *  page-per-card stack — content edits can add or remove pages at any
     *  time, so this tracks the same mutations the measurement does. */
    _measure() {
      const hdr = this.querySelector(':scope > [slot="header"]');
      const ftr = this.querySelector(':scope > [slot="footer"]');
      const wasPaginated = this._sheet.classList.contains('paginated');
      this._sheet.classList.toggle('paginated', this.querySelector(':scope > .page') !== null);
      // The WebKit @page margin is flowing-only, so a pagination flip
      // must re-emit the rule (content edits can add or remove .page
      // sections at any time).
      if (this._sheet.classList.contains('paginated') !== wasPaginated) {
        this._syncPrintPageRule();
      }
      this._syncSize(hdr ? hdr.offsetHeight : 0, ftr ? ftr.offsetHeight : 0);
    }
  }
  if (!customElements.get('doc-page')) {
    customElements.define('doc-page', DocPage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/doc-page.js", error: String((e && e.message) || e) }); }

__ds_ns.ActiveSessionBar = __ds_scope.ActiveSessionBar;

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.DataState = __ds_scope.DataState;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Screen = __ds_scope.Screen;

__ds_ns.TabBar = __ds_scope.TabBar;

__ds_ns.VersionFooter = __ds_scope.VersionFooter;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.ChipGroup = __ds_scope.ChipGroup;

__ds_ns.RatingScale = __ds_scope.RatingScale;

__ds_ns.TextLink = __ds_scope.TextLink;

__ds_ns.UnderlineInput = __ds_scope.UnderlineInput;

__ds_ns.ActionCard = __ds_scope.ActionCard;

__ds_ns.SessionHistoryCard = __ds_scope.SessionHistoryCard;

__ds_ns.WeekStrip = __ds_scope.WeekStrip;

__ds_ns.BalanceBars = __ds_scope.BalanceBars;

__ds_ns.LoadTrendChart = __ds_scope.LoadTrendChart;

__ds_ns.MetricRow = __ds_scope.MetricRow;

__ds_ns.SignalCard = __ds_scope.SignalCard;

__ds_ns.StrengthProgression = __ds_scope.StrengthProgression;

__ds_ns.Sheet = __ds_scope.Sheet;

__ds_ns.SheetField = __ds_scope.SheetField;

__ds_ns.ExerciseBlock = __ds_scope.ExerciseBlock;

__ds_ns.SetRow = __ds_scope.SetRow;

})();
