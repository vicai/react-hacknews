import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      start: 0,
      batch: 30
    };

    this.handleMoreClick = this.handleMoreClick.bind(this);
  }

  fetchNews() {
    fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty")
      .then(response => response.json())
      .then(news => {
        return Promise.all(
          news
            .slice(this.state.start, this.state.start + this.state.batch)
            .map(newsId =>
              fetch(
                `https://hacker-news.firebaseio.com/v0/item/${newsId}.json?print=pretty`
              ).then(response => response.json())
            )
        );
      })
      .then(items => {
        this.setState({
          items,
          start: this.state.start + this.state.batch
        });
      });
  }

  componentDidMount() {
    this.fetchNews();
  }

  handleMoreClick() {
    this.fetchNews();
  }

  extractHostname(url) {
    if (!url) return "";
    let hostname;

    if (url.indexOf("//") > -1) {
      hostname = url.split("/")[2];
    } else {
      hostname = url.split("/")[0];
    }

    hostname = hostname.split(":")[0];
    hostname = hostname.split("?")[0];

    return hostname;
  }

  render() {
    const { start, items, batch } = this.state;

    items.map(item => {
      item["domain"] = this.extractHostname(item.url);
      return item;
    });

    return (
      <div className="App">
        <div className="hn-table">
          <div className="news-title">
            <a href="https://news.ycombinator.com">
              <img
                alt="yc-logo"
                className="yc-logo"
                src="https://news.ycombinator.com/y18.gif"
              />
            </a>
            <span>
              <b className="hnname">Hacker News</b>
              <span>new | comments | show | ask | jobs | submit</span>
            </span>
          </div>
          <div className="news-container">
            {items.map((item, i) => (
              <div key={item.id}>
                <div className="news-item" key={i}>
                  <div className="news-idx">{start - batch + i + 1}.</div>
                  <div className="news-content">
                    <a href={item.url} target="_blank">
                      <div>{item.title}</div>
                    </a>
                  </div>
                  <div className="news-domain">({item.domain})</div>
                </div>
                <div className="news-info">
                  {item.score} points by {item.by}{" "}
                  {Math.floor((Date.now() / 1000 - item.time) / 3600)} hours ago
                  | hide | {!!item.kids ? item.kids.length : 0} comments
                </div>
              </div>
            ))}
          </div>
          <button onClick={this.handleMoreClick}>More</button>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
