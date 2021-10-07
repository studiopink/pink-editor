export const debounce = function(func, wait, immediate) {
    let timeout;

    return function executedFunction() {
        const context = this;
        const args = arguments;

        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};

export const trottle = function(func, time, immediate) {
    let lastCall;
    let previousCall;
    return function executedFunction() {
        const context = this;
        const args = arguments;

        previousCall = lastCall;
        lastCall = Date.now();

        if (previousCall === undefined ||
            (lastCall - previousCall) > time) {
            func.apply(context, args);
            //console.log('trottle');
        }
    }
}