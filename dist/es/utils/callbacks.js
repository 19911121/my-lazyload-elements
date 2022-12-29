const CallbackNames = {
    Error: 'error',
    Call: 'call',
    Show: 'show',
    Hide: 'hide',
};
const makeResult = (element, entry) => {
    return {
        element,
        isIntersecting: entry ? entry.isIntersecting : false,
        intersectionRatio: entry ? entry.intersectionRatio : -1,
    };
};

export { CallbackNames, makeResult };
