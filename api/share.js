export default function handler(req, res) {
  const { t, s, a, n } = req.query;
  // t = relation type (lover/friend/family/work)
  // s = total score (-30 ~ +30)
  // a = answers string (for restore)
  // n = name (상대 이름/별명)

  const score = parseInt(s) || 0;
  const typeLabels = { lover: '연인', friend: '친구', family: '가족', work: '직장동료' };
  const typeLabel = typeLabels[t] || '관계';

  // 손절지수 (0~100, 높을수록 손절)
  const toxPct = Math.round((30 - score) / 60 * 100);

  // Grade
  let emoji, label, hookMsg;
  if (score >= 19) {
    emoji = '🌟'; label = '꽃길';
    hookMsg = '이 사람, 절대 놓지 마세요';
  } else if (score >= 1) {
    emoji = '💚'; label = '양호';
    hookMsg = '나쁘지 않아요, 근데 방심은 금물';
  } else if (score >= -18) {
    emoji = '⚠️'; label = '경고';
    hookMsg = '노란불 켜졌습니다';
  } else {
    emoji = '🚨'; label = '위험';
    hookMsg = '지금 당장 거리를 두세요';
  }

  const name = n ? decodeURIComponent(n) : '';
  const ogTitle = name ? `${name} 손절지수 ${toxPct}% — ${emoji} ${typeLabel}` : `손절지수 ${toxPct}% — ${emoji} ${typeLabel} 관계`;
  const ogDesc = hookMsg;
  const ogImage = 'https://toximeter.vercel.app/og-image.png';
  const siteUrl = 'https://toximeter.vercel.app';

  // Restore hash for redirect
  const hashData = JSON.stringify({ t, a: a || '', s: score, n: name || '이 사람' });
  const hash = Buffer.from(hashData).toString('base64');
  const redirectUrl = `${siteUrl}/#${hash}`;

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${ogTitle}</title>
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${ogDesc}">
<meta property="og:image" content="${ogImage}">
<meta property="og:type" content="website">
<meta property="og:url" content="${siteUrl}/api/share?t=${t}&s=${s}&n=${encodeURIComponent(name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${ogTitle}">
<meta name="twitter:description" content="${ogDesc}">
<meta name="twitter:image" content="${ogImage}">
<meta http-equiv="refresh" content="0;url=${redirectUrl}">
</head>
<body>
<script>window.location.replace("${redirectUrl}");</script>
<p>이동 중... <a href="${redirectUrl}">여기를 클릭하세요</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
}
