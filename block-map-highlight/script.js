class MiniMapPosition {
    
        createScrollEvent(){
            const map = this;
            window.addEventListener('scroll', e => {
                map.update();
            });
        }
    
        create (source, target)  {
            this.source = source;
            this.target = target;
            this.posmark = target.append('rect')
                              .attr('width', '100%')
                              .attr('class', 'posmark');
            
            
            this.isUpdated = false;
            this.state = {y: 0, h: window.innerHeight};
    
            this.vertScale = d3.scaleLinear();
            this.createScrollEvent();
            return this;
        };
    
        update() {
            let {height, top, bottom} = this.source.node().getBoundingClientRect();
            let {height: mapHeight} = this.target.node().getBoundingClientRect();
            this.state = {
                y: top,
                h: window.innerHeight,
                height: height,
                mapHeight: mapHeight
            };
            
            console.dir(this.state);
    
            if (!this.isUpdated) {
              window.requestAnimationFrame(() =>  {
                this.render();
                this.isUpdated = false;
              });
            }
            this.isUpdated = true;
            return this;
    
        }
    
        render () {
            this.vertScale.domain([0, this.state.height])
                          .range([0,this.state.mapHeight]);
            this.posmark.attr('y', this.vertScale(0 - this.state.y));
            this.posmark.attr('height', this.vertScale(this.state.h));
        }
    
    
    }
    

const body = d3.select('body')
const svg = body.append('svg')
			.attr('class', 'map')
const textArea = body.append('div')
					.attr('class', 'content')

					

for(let i = 0; i < 100; i++){
	textArea.append('p').text('loremdsf sdfsdf sdfsdf dsd fsdsadasd asdasda sdasd ad f ');
}



const posmarker = new MiniMapPosition().create(textArea, svg).update();

console.log(textArea.node().scrollTop);
console.dir(textArea.node().getBoundingClientRect())

