export function parseTransaction(message) {
  if (!message || typeof message !== 'string') return null;

  const msg = message.toLowerCase();
  let network = 'unknown';
  let type = 'other';

  // Network Detection
  if (
    msg.includes('airtel') ||
    msg.includes('received mwk') ||
    msg.includes('has deposited') ||
    msg.includes('airtel money')
  ) {
    network = 'airtel';
  } else if (
    msg.includes('tnm') ||
    msg.includes('mpamba') ||
    msg.includes('air money')
  ) {
    network = 'tnm';
  } else if (
    msg.includes('vodacom') ||
    msg.includes('m-pesa')
  ) {
    network = 'vodacom';
  }

  // Transaction Type Detection
  if (msg.includes('betpawa') || msg.includes('premierbet') || msg.includes('betting')) {
    type = 'gambling';
  } else if (
    msg.includes('airtime') ||
    msg.includes('topup') ||
    msg.includes('top-up') ||
    msg.includes('recharge')
  ) {
    type = 'airtime';
  } else if (
    msg.includes('deposited') ||
    msg.includes('received') ||
    msg.includes('credited') ||
    msg.includes('salary') ||
    msg.includes('payment received') ||
    msg.includes('transfer in')
  ) {
    type = 'income';
  } else if (
    msg.includes('sent') ||
    msg.includes('paid') ||
    msg.includes('withdrawn') ||
    msg.includes('transfer out') ||
    msg.includes('debited') ||
    msg.includes('payment') ||
    msg.includes('spent')
  ) {
    type = 'expense';
  }

  // Amount Extraction
  const amountPatterns = [
    /(?:MK|MWK)\s?([\d,]+(?:\.\d{1,2})?)/i,
    /K\s?([\d,]+(?:\.\d{1,2})?)/i,
    /amount[:\s]+([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s?(?:MWK|MK)/,
  ];

  let amount = 0;
  for (const pattern of amountPatterns) {
    const match = message.match(pattern);
    if (match) {
      amount = safeNumber(match[1].replace(/,/g, ''));
      break;
    }
  }

  // Sender Extraction
  let sender = 'Unknown';
  const senderPatterns = [
    /^(.*?)\s+(?:has|deposited)/i,
    /from\s+(.*?)\s+(?:\d|ref)/i,
    /sender[:\s]+([^,\n]+)/i,
    /from:\s+([^,\n]+)/i,
  ];

  for (const pattern of senderPatterns) {
    const match = message.match(pattern);
    if (match) {
      sender = match[1].trim();
      break;
    }
  }

  // Transaction ID Extraction
  let tid = null;
  const tidPatterns = [
    /([A-Z]{2}\d+\.\d+\.[A-Z0-9]+)/i,
    /(?:ref|txn|id)[:\s]#?([A-Z0-9]+)/i,
    /([A-Z0-9]{8,})/i,
  ];

  for (const pattern of tidPatterns) {
    const match = message.match(pattern);
    if (match) {
      tid = match[1];
      break;
    }
  }

  if (!tid) {
    tid = `SMS_${amount}_${Date.now()}`;
  }

  // Savings Engine
  let savingsPercent = 0;
  let saveAmount = 0;
  let savingsStatus = 'denied';
  let requiresTransfer = false;

  if (type === 'income' && amount > 0) {
    if (amount > 20000) {
      savingsPercent = 25;
    } else if (amount > 5000) {
      savingsPercent = 35;
    } else if (amount > 1000) {
      savingsPercent = 40;
    } else {
      savingsPercent = 50;
    }

    saveAmount = Math.floor(amount * (savingsPercent / 100));

    if (saveAmount >= 100) {
      savingsStatus = 'approved';
      requiresTransfer = true;
    } else {
      savingsStatus = 'pending';
      requiresTransfer = false;
    }
  }

  return {
    id: tid,
    tid,
    network,
    type,
    amount,
    sender,
    savingsPercent,
    saveAmount,
    savingsStatus,
    requiresTransfer,
    rawMessage: message,
    timestamp: Date.now(),
    processed: false
  };
}

function safeNumber(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}
