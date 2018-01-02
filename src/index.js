/*
    Original URL from React tutorial: https://reactjs.org/tutorial/tutorial.html
    
    This version was enhanced by Jorge Garifuna <garifuna@gmail.com> on 1/1/18 with the following:
    
    1) Display the location for each move in the format (col, row) in the move history list.
    2) Bold the currently selected item in the move list.
    3) Rewrite Board to use two loops to make the squares instead of hardcoding them.
    4) Add a toggle button that lets you sort the moves in either ascending or descending order.
    5) When someone wins, highlight the three squares that caused the win.
    
*/
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import classNames from 'classnames';

function Square(props) {
    // CSS classes to include in button
    let cssClass = classNames({
        'square': true, 
        'square_current' : (props.currentButtonNumber === props.currentButtonIndex),
        'square_winner': ((props.winnerButtons[1] && props.winnerButtons.indexOf(props.currentButtonIndex) !== -1) ? true: false)
    });
    
    return (
        <button className={cssClass} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                currentButtonNumber={this.props.currentButtonNumber}
                winnerButtons={this.props.winnerButtons}
                currentButtonIndex={i}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {

        let lStrBoardSquares = '';
            
        const numberOfSquares = Array(9).fill(null);
        lStrBoardSquares = numberOfSquares.map((item, i) => {
            let lStrData = null;
            
            if ((i + 1) % 3 === 0) { // start a new row
                lStrData = <br />
            }
            const lStrSquare = this.renderSquare(i);
            
            return (<span key={i}>{lStrSquare}{lStrData}</span>)
        })
        return (
            <div>
                {lStrBoardSquares}
            </div>
        
            
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                    position: null,
                    buttonNumber: null,
                    winnerButtons: Array(3).fill(null)
                }
            ],
            stepNumber: 0,
            xIsNext: true,
            sortOrder: 0 // 0 asc, 1 desc
            
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const position = calculateBoardPosition(i);
        
        if (calculateWinner(squares) || squares[i]) {            
            return;
        }
        
        squares[i] = this.state.xIsNext ? "X" : "O";

        const winner = calculateWinner(squares); // check for winner, so we can highlight winner buttons

        let winnerButtons = Array(3).fill(null);
        if (winner) {

            if (winner) { // get the winner buttons
                winnerButtons = getWinnerButtons(squares);  
            }

        }
        
        this.setState({
            history: history.concat([
                {
                    squares: squares,
                    position: position,
                    buttonNumber: i,
                    winnerButtons: winnerButtons.slice()
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext            
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    /*
        Sets state to trigger steps sorting
        @author: Jorge Garifuna <garifuna@gmail.com>
        @date 1/1/18
        @return void
    */        
    sortSteps() { // set state to sort steps
        const currentSortOrder = this.state.sortOrder;

        this.setState({
            sortOrder: Math.abs(1 -  currentSortOrder) // 0 = ascesding, 1 = descending
        });

    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const currentSortOrder = this.state.sortOrder;
        const numberOfSteps = history.length;
        
        
        let sortedHistory = history.slice();
        if (currentSortOrder) { // reverse history if desceding order is selected
            sortedHistory.reverse();
        }
        
        const moves = sortedHistory.map((step, move) => {

            // reverse move if descending order is selected
            move = currentSortOrder ? (numberOfSteps - move - 1) : move;

            const desc = move ? 'Go to move #' + move +  step.position : 'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        let sortAction;
        if (numberOfSteps > 1) { // show steps action button
            let sortLabel = this.state.sortOrder ? '\u2191' : '\u2193';  // up and down entities
            
            sortAction = <button onClick={() => this.sortSteps()}>Sort Steps {sortLabel}</button>
        }
        
        return (
            <div className="game">
                <div className="game-board">
                <Board
                    squares={current.squares}
                    currentButtonNumber={current.buttonNumber}
                    winnerButtons={current.winnerButtons}
                    onClick={i => this.handleClick(i)}
                />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div className="sort-action">{sortAction}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function getLines() {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    return lines;
}

/*
    Calculates board position
    @author: Jorge Garifuna <garifuna@gmail.com>
    @date 1/1/18
    @param int squareNumber
    @return string | null
*/
function calculateBoardPosition(squareNumber) {
    const lines = getLines();
    
    for(let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squareNumber === a){
            return ' (row ' + (i + 1) +', column 1)';
        } else if (squareNumber === b){
            return ' (row ' + (i + 1) +', column 2)';
        } else if (squareNumber === c){
            return ' (row ' + (i + 1) +', column 3)';
        }
    }
    return null;
}

/*
    Obtains the winner buttons numbers in an array.
    @author: Jorge Garifuna <garifuna@gmail.com>
    @date 1/1/18
    @param array squares
    @return array
*/
function getWinnerButtons(squares) {
    const lines = getLines();

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return lines[i];
        }
    }
    return Array(3).fill(null);
}


function calculateWinner(squares) {
    const lines = getLines();
    
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
