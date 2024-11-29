function onEmbeddedMessage(iframe, event) {
    if (iframe.contentWindow !== event.source) {
        return;
    }
    const message = event.data;
    if (message.type === "height") {
        if (!iframe.dataset._tbitsTakeover) {
            iframe.style.height = message.data.height + "px";
            iframe.style.maxHeight = message.data.height + "px";
        }
        iframe.parentElement.style.minHeight = message.data.height + "px";
    } else if (message.type === "third_party_tracking") {
        tbitsOnTrackingEvent(message.data);
    } else if (message.type === 'open_purchase_modal') {
        tbitsOpenUniversePurchaseModal(message.data.iframe_url);
    } else if (message.type === 'scroll') {
        if (message.data) {
            window.scrollTo(0, message.data);
        } else {
            iframe.scrollIntoView({block: "end", behavior: "smooth"});
        }
    }
}

function tbitsOnTrackingEvent(event) {
    if (event.type === 'gtag') {
        if (window.gtag) {
            window.gtag(...event.arguments);
        }
    } else if (event.type === 'gtm') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(event.arguments[0]);
    } else if (event.type === 'fbq') {
        if (window.fbq) {
            window.fbq(...event.arguments);
        }
    } else if (event.type === 'ttq') {
        if (window.ttq) {
            window.ttq.track(...event.arguments);
        }
    }
}

function tbitsOpenUniversePurchaseModal(url) {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.setAttribute('id', 'tbits-purchase-modal');
    iframe.setAttribute('allowtransparency', 'true');
    Object.assign(iframe.style, {
        position: 'fixed',
        opacity: '0',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        border: 0,
        colorScheme: 'normal'
    })
    document.body.appendChild(iframe);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('message', function eventHandler(event) {
        if (event.data.type === 'height') {
            return;
        }
        if (event.source === iframe.contentWindow) {
            const message = event.data;
            if (message.type === 'close_purchase_modal') {
                iframe.remove();
                document.body.style.overflow = originalOverflow;
                window.removeEventListener('message', eventHandler);
            } else if (message.type === 'purchase_modal_ready') {
                iframe.style.opacity = '1'
            } else if (message.type === 'third_party_tracking') {
                tbitsOnTrackingEvent(message.data);
            }
        }
    })
}

function onScroll(divId, pageTabId) {
    const embedded = document.getElementById(divId);
    if (embedded) var offset = embedded.offsetTop;
    offset = window.pageYOffset - offset;
    if (embedded.contentWindow) {
        if (pageTabId != null) {
            embedded.contentWindow.postMessage("onscroll-" + pageTabId + "," + offset, '*');
        } else {
            embedded.contentWindow.postMessage("onscroll," + offset, '*');
        }
    }
}

function loadTradablebitsApp(divId, pageTabId, baseURL = "https://tradablebits.com") {
    const el = document.getElementById(divId);
    try {
        var width = $(el).width();
    } catch (Exception) {
        el.style.paddingLeft = "0";
        el.style.paddingRight = "0";
    }

    const params = new URLSearchParams(location.search);
    const iframeId = 'tbits-iframe-' + pageTabId;
    el.innerHTML = `
        <iframe id="${iframeId}" src="${baseURL}/tb_app/${pageTabId}?${params.toString()}"
            allow="clipboard-read; clipboard-write; web-share"
            sandbox="allow-storage-access-by-user-activation allow-top-navigation allow-forms allow-modals allow-downloads allow-popups allow-scripts allow-same-origin" 
            style="min-width:100%;width:0;height:200px;border:0;overflow:hidden;"></iframe>
    `;

    const frame = document.getElementById(iframeId)
    window.addEventListener("message", function (event) {
        onEmbeddedMessage(frame, event);
    });
    window.addEventListener("scroll", function (event) {
        onScroll(iframeId, pageTabId);
    });

    // Used for stream app
    setInterval(function () {
        const embedded = document.getElementById("iframe-" + divId);
        if (embedded) {
            embedded.contentWindow.postMessage(['winsize', window.innerWidth, window.innerHeight].join(','), '*');
        }
    }, 100);
}

function loadTradablebitsLiveResults(divId, pageTabId, baseURL = "https://tradablebits.com/") {
    const el = document.getElementById(divId);
    try {
        var width = $(el).width();
    } catch (Exception) {
        el.style.paddingLeft = "0";
        el.style.paddingRight = "0";
    }

    const height = el.style.height
    const params = location.search.startsWith('?') ? location.search.split('?')[1] : location.search;
    const iframeId = 'tbits-iframe-' + pageTabId;
    el.innerHTML = `
        <iframe id="${iframeId}" src="${baseURL}/tb_live/${pageTabId}?${params}"
            sandbox="allow-storage-access-by-user-activation allow-top-navigation allow-forms allow-modals allow-downloads allow-popups allow-scripts allow-same-origin"
            style="min-width:100%;width:0;height:${height};border:0;overflow:hidden;"></iframe>
    `;
    const frame = document.getElementById(iframeId)
    window.addEventListener("message", function (event) {
        onEmbeddedMessage(frame, event);
    });
    window.addEventListener("scroll", function (event) {
        onScroll(iframeId, pageTabId);
    });

    // Used for stream app
    setInterval(function () {
        const embedded = document.getElementById("iframe-" + divId);
        if (embedded) {
            embedded.contentWindow.postMessage(['winsize', window.innerWidth, window.innerHeight].join(','), '*');
        }
    }, 100);
}

function loadTradablebitsScheduler(divId, businessId, baseURL = "https://tradablebits.com/") {
    const el = document.getElementById(divId);
    try {
        var width = $(el).width();
    } catch (Exception) {
        el.style.paddingLeft = "0";
        el.style.paddingRight = "0";
    }
    const iframeId = 'tbits-iframe-' + businessId;
    el.innerHTML = `
        <iframe id="${iframeId}" src="${baseURL}/schedule/${businessId}"
            sandbox="allow-storage-access-by-user-activation allow-top-navigation allow-forms allow-modals allow-downloads allow-popups allow-scripts allow-same-origin"
            style="min-width:100%;width:0;border:0;overflow:hidden;"></iframe>
    `;
    const frame = document.getElementById(iframeId)
    window.addEventListener("message", function (event) {
        onEmbeddedMessage(frame, event);
    });
    window.addEventListener("scroll", function (event) {
        onScroll(iframeId, businessId);
    });
}

function loadStream(divId, streamKey, label, baseURL = "https://tradablebits.com/") {
    const el = document.getElementById(divId);
    el.style.overflow = "hidden";
    const iframeId = 'iframe-' + divId;
    const params = new URLSearchParams();
    params.set('access_type', 'embedded');
    params.set('label', label);
    el.innerHTML = `
        <iframe id="${iframeId}" src="${baseURL}streams/${streamKey}?${params}"
            sandbox="allow-storage-access-by-user-activation allow-top-navigation allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
            style="width:100%;height:200px;border:0;overflow:hidden;"></iframe>
    `;
    const frame = document.getElementById(iframeId)
    window.addEventListener("message", function (event) {
        onEmbeddedMessage(frame, event);
    });
    window.addEventListener("scroll", function (event) {
        onScroll(iframeId, null);
    });
    setInterval(function () {
        const iframe = document.getElementById("iframe-" + divId);
        const message = ['winsize', window.innerWidth, window.innerHeight].join(',');
        try {
            iframe.contentWindow.postMessage(message, baseURL);
        } catch (error) {
            iframe.contentWindow.postMessage(message, '*');
        }
    }, 100);
}


function loadStreamWidget(divId, streamKey, baseURL = "https://tradablebits.com/") {
    var style = "border:0px solid #000;padding:0px;margin:0px;overflow:hidden;width:280px;height:315px;";
    const el = document.getElementById(divId);
    el.innerHTML = `
        <iframe id="tbits-stream-iframe" src="${baseURL}streams/${streamKey}/widget" style="${style}"></iframe>
    `;
    el.setAttribute("style", style);
}