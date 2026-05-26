/**
 * 3 banner EvoMarket 2026 — SVG nhúng trong bundle (không cần file ảnh /public).
 * Chỉ render một slide tại một thời điểm để tránh trùng id trong defs.
 */

function Slide1({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 360"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="hb1g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="55%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="hb1shine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="hb1shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>
      <rect width="1600" height="360" fill="url(#hb1g)" />
      <rect width="1600" height="360" fill="url(#hb1shine)" />
      <circle cx="1320" cy="80" r="140" fill="#fff" opacity="0.06" />
      <circle cx="200" cy="300" r="180" fill="#fff" opacity="0.05" />
      <text
        x="72"
        y="118"
        fill="#fff"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="42"
        fontWeight="700"
        filter="url(#hb1shadow)"
      >
        Chào 2026
      </text>
      <text
        x="72"
        y="178"
        fill="#ffedd5"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="28"
        fontWeight="600"
      >
        Khám phá xu hướng mới cùng EvoMarket
      </text>
      <text
        x="72"
        y="228"
        fill="#fed7aa"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="18"
        fontWeight="500"
        opacity="0.95"
      >
        Ưu đãi theo mùa · Giao nhanh · Hỗ trợ 8h–22h
      </text>
      <rect x="72" y="258" width="200" height="44" rx="10" fill="#fff" opacity="0.95" />
      <text
        x="172"
        y="288"
        textAnchor="middle"
        fill="#c2410c"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="17"
        fontWeight="700"
      >
        Mua sắm ngay
      </text>
      <text
        x="1520"
        y="300"
        textAnchor="end"
        fill="#ffedd5"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="56"
        fontWeight="800"
        opacity="0.35"
      >
        2026
      </text>
    </svg>
  );
}

function Slide2({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 360"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="hb2g" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <pattern id="hb2grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1600" height="360" fill="url(#hb2g)" />
      <rect width="1600" height="360" fill="url(#hb2grid)" />
      <polygon points="0,360 520,360 420,0 0,0" fill="#000" opacity="0.12" />
      <text
        x="72"
        y="125"
        fill="#fff"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="38"
        fontWeight="800"
      >
        Flash Sale 2026
      </text>
      <text
        x="72"
        y="182"
        fill="#fecaca"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="24"
        fontWeight="600"
      >
        Giảm sâu hàng tuần · Đổi trả trong 7 ngày
      </text>
      <text x="72" y="230" fill="#fed7aa" fontFamily="system-ui, Segoe UI, sans-serif" fontSize="17">
        Kéo xuống khám phá sản phẩm bán chạy
      </text>
      <g transform="translate(1180, 60)">
        <rect width="280" height="240" rx="20" fill="#fff" opacity="0.12" />
        <rect x="24" y="32" width="232" height="56" rx="12" fill="#fff" opacity="0.25" />
        <rect x="24" y="108" width="160" height="36" rx="8" fill="#fff" opacity="0.18" />
        <rect x="24" y="164" width="200" height="36" rx="8" fill="#fff" opacity="0.18" />
        <circle cx="220" cy="182" r="36" fill="#fbbf24" opacity="0.95" />
        <text
          x="220"
          y="192"
          textAnchor="middle"
          fill="#78350f"
          fontFamily="system-ui, sans-serif"
          fontSize="20"
          fontWeight="800"
        >
          %
        </text>
      </g>
      <text
        x="1480"
        y="320"
        textAnchor="end"
        fill="#fff"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="22"
        fontWeight="700"
        opacity="0.5"
      >
        EvoMarket
      </text>
    </svg>
  );
}

function Slide3({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 360"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="hb3g" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#7c2d12" />
          <stop offset="35%" stopColor="#ea580c" />
          <stop offset="70%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <radialGradient id="hb3glow" cx="75%" cy="25%" r="55%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="360" fill="url(#hb3g)" />
      <rect width="1600" height="360" fill="url(#hb3glow)" />
      <ellipse cx="280" cy="200" rx="200" ry="120" fill="#fff" opacity="0.06" />
      <text
        x="72"
        y="128"
        fill="#fff"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="40"
        fontWeight="800"
      >
        EvoMarket · Mua sắm thông minh
      </text>
      <text
        x="72"
        y="186"
        fill="#ffedd5"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="24"
        fontWeight="600"
      >
        Tích Xu Evo · Ưu đãi mỗi ngày
      </text>
      <text
        x="72"
        y="234"
        fill="#fed7aa"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="17"
        opacity="0.95"
      >
        Trải nghiệm giao diện mới 2026 — nhanh, gọn, rõ ràng
      </text>
      <g transform="translate(1080, 88)">
        <rect
          width="420"
          height="184"
          rx="24"
          fill="#000"
          opacity="0.15"
          stroke="#fff"
          strokeOpacity="0.2"
        />
        <text x="32" y="52" fill="#fff" fontFamily="system-ui, sans-serif" fontSize="20" fontWeight="700">
          Ưu đãi thành viên
        </text>
        <text x="32" y="92" fill="#fed7aa" fontFamily="system-ui, sans-serif" fontSize="16">
          Nhận thông báo deal theo sở thích
        </text>
        <rect x="32" y="118" width="160" height="40" rx="10" fill="#fff" />
        <text
          x="112"
          y="145"
          textAnchor="middle"
          fill="#9a3412"
          fontFamily="system-ui, sans-serif"
          fontSize="15"
          fontWeight="700"
        >
          Bắt đầu
        </text>
      </g>
      <text
        x="1528"
        y="72"
        textAnchor="end"
        fill="#fff"
        fontFamily="system-ui, sans-serif"
        fontSize="18"
        fontWeight="700"
        opacity="0.85"
      >
        Năm 2026
      </text>
    </svg>
  );
}

/** Thứ tự giống carousel cũ: slide 1 → 2 → 3 */
export const HOME_BANNER_SLIDES = [Slide1, Slide2, Slide3];
