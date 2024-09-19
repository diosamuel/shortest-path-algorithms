import { Block } from "../canvas/block"
import { AlgorithmInterface } from "../types/algorithm"
import { BlockStatus, Coordinate } from "../types/canvas"

export default class biastar implements AlgorithmInterface {
    name: string = "biastar"
    startPosition: Coordinate 
    endPosition: Coordinate
    openSetForward: Block[] = []
    openSetBackward: Block[] = []
    pathForward: Block[] = []
    pathBackward: Block[] = []
    closedSetForward: Block[] = []
    closedSetBackward: Block[] = []
    meetingPoint: Block | null = null

    solve(blocks: Block[][], start: Coordinate, end: Coordinate, speed: number) {
        let startBlock: Block = blocks[start.y][start.x]
        let targetBlock: Block = blocks[end.y][end.x]
        this.openSetForward.push(startBlock)
        this.openSetBackward.push(targetBlock)

        const run = () => {
            setTimeout(() => {
                if(this.openSetForward.length > 0 && this.openSetBackward.length > 0 && !this.meetingPoint) {
                    this.openSetForward.sort((a,b) => this.fscore(a, targetBlock) - this.fscore(b, targetBlock))
                    this.openSetBackward.sort((a,b) => this.fscore(a, startBlock) - this.fscore(b, startBlock))
                    
                    let currentBlockForward = this.openSetForward.shift()
                    let currentBlockBackward = this.openSetBackward.shift()
                    
                    this.closedSetForward.push(currentBlockForward)
                    this.closedSetBackward.push(currentBlockBackward)

                    if(![startBlock, targetBlock].includes(currentBlockForward)) {
                        currentBlockForward.status = BlockStatus.CHECKING
                    }
                    if(![startBlock, targetBlock].includes(currentBlockBackward)) {
                        currentBlockBackward.status = BlockStatus.CHECKING
                    }
        
                    if (this.closedSetForward.some(block => this.closedSetBackward.includes(block))) {
                        this.meetingPoint = this.closedSetForward.find(block => this.closedSetBackward.includes(block))
                        return this.finish(startBlock, targetBlock)
                    }
        
                    this.expandNode(currentBlockForward, this.openSetForward, this.closedSetForward)
                    this.expandNode(currentBlockBackward, this.openSetBackward, this.closedSetBackward)

                    run()
                }
            }, speed)
        }
        run()
    }

    expandNode(currentBlock: Block, openSet: Block[], closedSet: Block[]) {
        for(let i = 0; i < currentBlock.neighbors.length; i++) {
            let neighbor = currentBlock.neighbors[i]
            if(neighbor.status == BlockStatus.WALL || closedSet.includes(neighbor)) 
                continue

            let cost = currentBlock.gCost + 1
            if(cost < neighbor.gCost || !openSet.includes(neighbor)) {
                neighbor.gCost = cost 
                neighbor.parent = currentBlock
                
                if(!openSet.includes(neighbor)) {
                    openSet.push(neighbor)
                }
            }
        }
    }

    finish(startBlock: Block, targetBlock: Block) {
        if (this.meetingPoint) {
            let currentForward = this.meetingPoint
            while(currentForward != startBlock) {
                this.pathForward.unshift(currentForward)
                currentForward = currentForward.parent
            }

            let currentBackward = this.meetingPoint
            while(currentBackward != targetBlock) {
                this.pathBackward.push(currentBackward)
                currentBackward = currentBackward.parent
            }

            let fullPath = [...this.pathForward, ...this.pathBackward]
            for(let i = 0; i < fullPath.length; i++) {    
                fullPath[i].status = BlockStatus.PATH
            }
        }
    }

    fscore(from: Block, to: Block) {
        let g = from.gCost + to.distance;
        let h = this.heuristicDistance(to,from)

        return g + h
    }

    heuristicDistance(from: Block, to: Block) {
        return Math.sqrt(
            Math.abs(to.coordinate.x - from.coordinate.x) ** 2 + 
            Math.abs(to.coordinate.y - from.coordinate.y) ** 2
        )
    }

    // heuristicDistance(from: Block, to: Block) {
    //     return Math.abs(to.coordinate.x - from.coordinate.x) + 
    //            Math.abs(to.coordinate.y - from.coordinate.y);
    // }
    
}