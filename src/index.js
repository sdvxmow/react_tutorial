import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  return (
    <button className={`square ${props.value === 'X' ? 'font_color1': 'font_color2'} ${props.isHighlight ? 'highlight' : ''}`} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, isHighlight = false) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key = {i}
        isHighlight ={isHighlight}
      />
    );
  }

  render() {
    return(
      <div>
        {
          Array(3).fill(null).map((row,i) => {
            return(
              <div className='board-row' key={i}>
                {
                    Array(3).fill(null).map((col,j) => {
                      return(
                        this.renderSquare(i * 3 + j, this.props.highlightCells.indexOf(i * 3 + j) !== -1) 
                      )
                    })
                }
              </div>
            )
          })
        }
      </div>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        }
      ],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          col: (i % 3) + 1,
          row: Math.floor(i / 3) + 1,
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

  sortButton() {
    this.setState({
      sort: !this.state.sort
    })
  }

  expButton() {
    this.setState({
      exp: !this.state.exp
    })
  }
  

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winline = calculateWinner(current.squares);
    const exp = [
      'ルール説明',
      '　・1対1のボードゲームです',
      '　・交互に「O」と「X」を置いていきます',
      '　・縦横斜めのいずれかが先に揃った人の勝利です',
      '　・先攻はXです',
    ]
    const func = [
      '機能説明',
      '　・盤面の置きたい場所をクリックするとそこに置くことができます',
      '　・右のリストをクリックすると手番を戻したり、盤面をリセットすることができます',
      '　・昇順・降順ボタンでリストの昇順と降順を並び変えることができます'
    ]

    const moves = history.map((step, move) => {
      const desc = move ?
         move +'手目 (' + step.col + ',' + step.row + ')':
        '盤面リセット';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} className={this.state.stepNumber === move ? 'bold list': 'list'}>{desc}</button>
        </li>
      );
    });

    let status;
    let sClass;
    if (winline) {
      if(winline.isDraw){
        status = 'draw';
        sClass = 'status box0';
      } else {
        status = winline.winner + 'の勝ち！';
        sClass = winline.winner === 'X' ? 'bold status box1':'bold status box2';
      }
    } else {
      status = (this.state.xIsNext ? "X" : "O") + 'の番です';
      sClass = this.state.xIsNext? 'status box1':'status box2';
    }

    return (
      <div>
        <h2 className='title'>OXゲーム</h2>
        
        <div className='exptext'>
        {exp.map((row,i) => {
          return(
            i===0?
            <h2>{!this.state.exp ? exp[i]:''}</h2> :
            <p>{!this.state.exp ? exp[i]:''}</p>
          )
        })}
        {func.map((row,i) => {
          return(
            i===0?
            <h2>{!this.state.exp ? func[i]:''}</h2> :
            <p>{!this.state.exp ? func[i]:''}</p>
          )
        })}

        </div>
        
        <div>         
            {this.state.exp ? 
              <button onClick={() => this.expButton()} className='bold expbutton1'>ルール説明はこちら</button>:
              <button onClick={() => this.expButton()} className='bold expbutton2'>ゲームスタート！</button>
            }
        </div>
        
        {this.state.exp ? 
          <div className="game">
          <div className="game-board">
            <div className={sClass}>{status}</div>
            <Board
              squares={current.squares}
              onClick={i => this.handleClick(i)}
              highlightCells={winline ? winline.line : []}
            />
          </div>
          <div className="game-info">
          <div><button onClick={() => this.sortButton()} className='sort'>{this.state.sort ? '降順':'昇順'}</button></div>
            <ol>{!this.state.sort ? moves:moves.reverse()}</ol>
          </div>
        </div>
        : ''}
        
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
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
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner:squares[a],
        line:[a,b,c],
      }
    }
  }

  if (squares.filter((e) => !e).length === 0) {
    return {
      isDraw: true,
      winner: null,
      line: []
    }
  }
  
  return null;
}
