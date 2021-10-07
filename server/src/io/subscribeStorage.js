module.exports = new class  {
    constructor() {
        this.store = [];
    }

    find(id) {
        return this.store.find(data => data.renderId == id);
    }

    replaceSubByRenderId(renderId, data) {
        this.store = this.store.map(item => {
            if(item.renderId == renderId) {
                return data;
            }

            return item;
        });
    }

    add(socketId, renderId) {
        this.removeSubscribe(renderId);
        this.store.push({ socketId, renderId });
    }

    removeSubscribe(renderId) {
        this.store = this.store.filter(data => data.renderId != renderId);
    }    
};