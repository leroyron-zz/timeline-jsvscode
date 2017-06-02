export const basic = {
    ////////////////////////////////////////////////////////////////////////
    app:`this.canvas.app = new function (app, canvas, ctx) {
    // Public
    this.width = app.resolution.width
    this.height = app.resolution.height
    this.resolution = function (app) {
        // Screen resize adjustments
        this.width = app.resolution.width
        this.height = app.resolution.height
    }
    this.resolution(app)

    // Private
    var variable

    function init () {
        document.getElementsByTagName('link')[0].href = app.codeLoc + '/style.css?v=1.0'
    }

    ctx.timeline.addon.timeframe.process = function () {
        ctx.process(this.access, this.frame._duration, this._timeFrame, this.lapse)// before timeFrame process
    }

    ctx.process = function (access, duration, timeFrame, lapse) {

    }

    ctx.timeline.addon.timeframe.invoke = function () {
        ctx.calc(this.lapse, this.access)// before render
        ctx.rendering(this._timeFrame)
        ctx.compute()// after render
    }

    ctx.calc = function (lapse, access) {

    }

    ctx.rendering = function (timeFrame) {

    }

    ctx.compute = function () {

    }

    this.SetupContextBindsForStreamAndBuildAfterLoad = function () {
        app.codeLoc = 'user/' + app.codesetting
        app.fileLocAssets = app.vscode._fileLocal + app.codeLoc + '/assets/'
        init()
        createGFXBindNodesToStream('timeline')
        buildStream()
    }

    function createGFXBindNodesToStream (stream) {
        console.log('Binding objects to stream - Starting')

        var bind = ctx[stream].addon.binding
        var buffer = ctx.timeline.addon.buffer

        var element = {position: {x: 0, y: 0}, variable: variable}
        // // Simple Bind and Buffering
        bind(stream, [
        [element.position, 800]
        ],
            [
            ['x', 100],
            ['y', 50]
            ],
        [801, 802],
        false)
        // // Bind existing element
        // Access --
        // element.position.x
        // element.position.y
        buffer.eval('timeline',
            [
                [
                [element.position], [[['x', 1000]]], [['linear', 2200]]
                ]
            ],
        false)

        // // Complex Bind and Buffering
        var obj = {position: {type: 'position'}, rotation: {type: 'rotation'}}
        element.nodes = bind(stream, [
        [obj.position, 800], [obj.rotation, 801]
        ],
            [
            ['x', 100],
            ['y', 50, 100]
            ],
        [801, 802],
        false)
        // // Binds multiple child nodes to element
        // Access --
        // element.nodes[0 or 1].position.x
        // element.nodes[0 or 1].position.y
        // element.nodes[0 or 1].rotation.x
        // element.nodes[0 or 1].rotation.
        var last = element.nodes[0].y + 140 - 280
        buffer.eval('timeline',
            [
                                                                    // even out formula ( stream.length / (displacements * eases ) )
                [                                                   //                                 2200 / (3 * 2) = 166
                    [element.nodes[0]], [[['y', 140], ['y', -280], ['y', element.nodes[0].y - last]]], [['easeInSine', 2200 / (3 * 2)], ['easeOutSine', 2200 / (3 * 2)]]//, *offset
                ]
            ],
        false)// false for non-relative values for timeframe reading
    }
    function buildStream (stream) {
        // build stream and prebuff from the binding DATA
        console.log('Finished Binding to stream - Building')
        ctx.timeline.build(function () {
            console.log('Finished Building - Initializing')
            ctx.timeline.addon.timeframe._init(window) // timeframe init has to be set to true for additional scripts to load
        })
    }
}(this.app, this.canvas, this.ctx)
`,
    ////////////////////////////////////////////////////////////////////////
    style:`body, html, iframe {width:100%; height:100%; margin: 0px; padding: 0px; overflow: hidden; -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover; border: 0; background: #000}
#info, #coords {color:#fff; position: absolute; bottom: 0px; left: 0px; z-index: 1;}
#coords {color: #000};
input {right: left;}
canvas, svg {position: absolute; top: 0px; left: 0px;}
text {font-size: 12px; fill: #bbb}
path, line {stroke: #aaa; fill: #FFF;}
.dg.ac {z-index: 1!important}`,
    comment:`window.Authority = {}`,
    segment:`window.Authority = {}`,
    action:`window.Authority = {}`,
    sound:`window.Authority = {}`
};