// Generated from tools/title_format.py by tools/generate_title_format_js.py
(function(global){
    function formatDisplayTitle(baseTitle, context){
        const normalizedBase = String(baseTitle || '').trim();
        const normalizedContext = String(context || '').trim();
        if(normalizedContext){
            return `${normalizedBase} — ${normalizedContext}`;
        }
        return normalizedBase;
    }

    function compactContext(path){
        const value = String(path || '').replace(/^\//, '');
        const parts = value.split('/').filter(Boolean);
        if(parts.length >= 2){
            return parts.slice(-2).join(' / ');
        }
        if(parts.length === 1){
            return parts[0];
        }
        return '';
    }

    global.TitleFormat = {
        formatDisplayTitle,
        compactContext
    };
})(typeof window !== 'undefined' ? window : globalThis);
