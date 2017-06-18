export const basic = {
    ////////////////////////////////////////////////////////////////////////
    app:`this.canvas.app = new function (app, canvas, ctx) {
    // -- Public
    this.Xres = this.width = app.width
    this.Yres = this.height = app.height
    this.aspect = Math.aspectRatio(this.height, this.width)
    this.resolution = function (app) {
        // Fullscreen 2D --
        // Screen resize adjustments
        canvas.node.width = this.Xres = this.width = app.width
        canvas.node.height = this.Xres = this.height = app.height
        canvas.node.style.width = app.width + 'px'
        canvas.node.style.height = app.height + 'px'

        // Unit scaling
        this.resX = this.Xres / canvas.node.width
        this.resY = this.Yres / canvas.node.height

// Aspect 2D --
/* // -- Public
   this.Xres = this.width = 680
   this.Yres = this.height = 225
        // Screen resize adjustments
        canvas.node.width = this.width = app.width
        canvas.node.height = this.height = this.aspect * app.width
        canvas.node.style.width = canvas.node.width + 'px'
        canvas.node.style.height = canvas.node.height + 'px'

        // Unit scaling
        this.resX = this.Xres / canvas.node.width
        this.resY = this.Yres / canvas.node.height
        */

// FullScreen 3D --
/* // -- Public
   this.width = app.resolution.width
   this.height = app.resolution.height
        // Screen resize adjustments
        this.width = app.resolution.width
        this.height = app.resolution.height
        */
    }
    this.resolution(app)

    // Private
    var variable
    var System = ctx.timeline.addon.runtime.system
    var addon = ctx.timeline.addon
    var timeframe = addon.timeframe

    function init () {
        buildStream(function () {
            // after build
        })
        var system = new System()// start new system and start the down-line
                        //   .Pointer()// the pointer such as a mouse or touch moves the cursor
                        //     .Knob()// the pointer moves the knob, knob moves the cursor
                        //   .Subject()// node/object moves the cursor
                                    // .Marquee()// cursor draws the marquee
                                    // .Grid()// the grid prepares the matrices to render textiles, boundaries, particles and collisions depending on cursor, knob or subject location
                                        //    .Parallax()// exploits grid data and cuts out necessary data for optimization, rendering and other various uses such as background movement
                                                    //   .Entity()// node/object collection optimized by parallax
                                                    //   .Physic()// chained physics optimized by parallax
                                                    //   .Bound()// utilizes the parallax exploits to resolve and utilize boundary matrices
                                                    //   .Collision()// utilizes the parallax exploits to resolve and utilize collision matrices
                                                                //   .Particle()// entities could emit particles, particle generation and behaviors affected by physics, boundaries and collisions
                                                                //   .Rig()// rigging behaviors affected by entities, physics, boundaries and collisions
    }

    timeframe.process = function () {
        ctx.process(this.access, this.frame._duration, this._timeFrame, this.lapse)// before timeFrame process
    }

    ctx.process = function (access, duration, timeFrame, lapse) {

    }

    timeframe.invoke = function () {
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
        document.getElementsByTagName('link')[0].href = app.codeLoc + '/style.css?v=1.0'
        queueBindingsAndBuffers('timeline')
        init()
    }

    function queueBindingsAndBuffers (stream) {
        console.log('Binding objects to stream - Starting')

        var bind = ctx[stream].addon.binding
        var buffer = ctx.timeline.addon.buffer

        var element = {position: {x: 0, y: 0}, variable: variable}
        // // Simple Bind and Buffering
        bind.queue(stream, [
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
        buffer.queue('eval', 'timeline',
            [
                [
                [element.position], [[['x', 1000]]], [['linear', 2200]]
                ]
            ],
        false)

        // // Complex Bind and Buffering
        var obj = {position: {type: 'position'}, rotation: {type: 'rotation'}}
        element.nodes = bind.init(stream, [
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
        var last = element.nodes[0].y + 140 - 280// bind.init processes bindings right away for use// !Properties must have the the highest
        buffer.queue('eval', 'timeline',
            [
                                                                    // even out formula ( stream.length / (displacements * eases ) )
                [                                                   //                                 2200 / (3 * 2) = 166
                    [element.nodes[0]], [[['y', 140], ['y', -280], ['y', element.nodes[0].y - last]]], [['easeInSine', 2200 / (3 * 2)], ['easeOutSine', 2200 / (3 * 2)]]//, *offset
                ]
            ],
        false)// false for non-relative values for timeframe reading
    }
    function buildStream (callback) {
        addon.binding.run(function () { // start processing queues
            addon.buffer.run()
        })
        timeframe._forceInit(window) // make sure window is fully loaded
        // build stream and prebuff from the binding DATA
        console.log('Finished Binding to stream - Building')
        ctx.timeline.build(function () {
            console.log('Finished Building - Initializing')
            // ctx.timeline.addon.timeframe._init(window) // timeframe init has to be set to true for additional scripts to load
            callback()
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
    ////////////////////////////////////////////////////////////////////////
    commentTemplate:`window.Authority = new function (app, timeline) {
    this.commentID = 'template'

    this.content =
    \`
    <div style='font-size: 14px;
    background: #fffbee;
    width: 100%;
    margin: 8px 0;
    display: inline-block;
    border-radius: 4px;
    box-sizing: border-box;
    '></div>
    \`

    this.label =
    \`
    \`

    this.style = \`
    #comment {position: relative; color: #000; font: 11px "Lucida Grande",sans-serif; left: 105px; top: 102px; width: 75%; z-index: 21;}
    #comment, .CM div {float: left; width: 100%;}
    .CM label {
        font-size: 14px;
        text-indent: 5px;
        float: left;
        display: block;
        position: relative;
        color: #222;
        border-radius: 1px;
        background: #fffae7;
        top: -1px;
        word-break: break-all;
    }
    .CM #content {overflow: auto; left: 25px; top: -15px;}
    \`

    app.comment = {
        _style: document.createElement('style'),
        element: document.createElement('div'),
        label: document.createElement('label'),
        content: document.createElement('div'),
        _resize: function () {
            this.element.style.width = (app.width - 392) + 'px'
            this.element.style.paddingRight = 20 + 'px'
            this.element.style.maxHeight = (app.height - 155) + 'px'
            this.content.style.maxHeight = (app.height - 140) + 'px'
        }
    }
    app.comment.element.id = 'comment'
    app.comment.element.className = 'CM'

    app.comment.label.innerHTML = this.label
    app.comment.content.innerHTML = this.content
    app.comment.content.id = 'content'

    app.comment.element.appendChild(app.comment.label)
    app.comment.element.appendChild(app.comment.content)

    app.comment._style.innerHTML = this.style
    app.element.appendChild(app.comment._style)
    app.comment.style = app.comment._style.cloneNode(true)
    app.comment.style.innerHTML = ''
    app.element.appendChild(app.comment.style)
    app.element.appendChild(app.comment.element)
    app.comment._resize()
    window.resizeCalls.push(app.comment)

    this.main = function () {
        app.comment.content.innerHTML = this.content
    }
    return this
}(this.app, this.ctx.timeline.addon.timeframe.timeline)
`,
    comment:`window.Authority = {"template":{}}`,
    segment:`window.Authority = {}`,
    action:`window.Authority = {}`,
    sound:`window.Authority = {}`
};