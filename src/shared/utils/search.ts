const normalizeText = (value: string) => {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
};

const tokenize = (value: string) => {
    const normalized = normalizeText(value);
    return normalized ? normalized.split(' ').filter(Boolean) : [];
};

const lcsLength = (a: string, b: string) => {
    const dp = new Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i += 1) {
        let prev = 0;
        for (let j = 1; j <= b.length; j += 1) {
            const temp = dp[j];
            if (a[i - 1] === b[j - 1]) {
                dp[j] = prev + 1;
            } else {
                dp[j] = Math.max(dp[j], dp[j - 1]);
            }
            prev = temp;
        }
    }
    return dp[b.length];
};

const isSubsequence = (needle: string, haystack: string) => {
    let i = 0;
    for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
        if (haystack[j] === needle[i]) i += 1;
    }
    return i === needle.length;
};

const tokenMatches = (queryToken: string, candidateToken: string) => {
    if (!queryToken || !candidateToken) return false;
    if (candidateToken.startsWith(queryToken)) return true;
    if (candidateToken.includes(queryToken)) return true;
    if (queryToken.length <= 3 && isSubsequence(queryToken, candidateToken)) return true;
    if (queryToken.length < 3) return false;
    const lcs = lcsLength(queryToken, candidateToken);
    return lcs / queryToken.length >= 0.7;
};

export const matchesSearch = (query: string, ...fields: Array<string | undefined | null>) => {
    const qTokens = tokenize(query);
    if (qTokens.length === 0) return true;
    const hayTokens = tokenize(fields.filter(Boolean).join(' '));
    if (hayTokens.length === 0) return false;
    return qTokens.every(qt => hayTokens.some(ht => tokenMatches(qt, ht)));
};
