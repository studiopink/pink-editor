export default class Timeline {
    constructor(soundtrack, background, fonts, tracks) {
        this.soundtrack = {...soundtrack };
        this.background = background; //string
        this.fonts = fonts; //array
        this.tracks = tracks;
    }

    // get soundtrack() {
    //     return {...this.soundtrack }
    // }

    // set soundtrack(val) {
    //     this.soundtrack = {...val }
    // }

    get bg() {
        return this.background
    }

    set bg(val) {
        this.background = val
    }
}