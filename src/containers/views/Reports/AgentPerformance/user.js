import React, { Component } from "react";
import { ListGroupItem, Progress } from "reactstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getImage } from "../../../../actions/users";

import avatar from "../../../../theme/avatar.jpg";

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extension: null
    }
  }

  componentWillMount() {
    this.props.getImage(this.props.data.extension);
    this.setState({ extension: this.props.extension });
  }

  componentDidUpdate() {
    if (this.state.extension !== this.props.data.extension) {
      this.setState({ extension: this.props.data.extension });
      this.props.getImage(this.props.data.extension);
    }
  }

  getColor(rank) {
    switch (rank) {
      case 1:
        return "titanium";
      case 2:
        return "platinum";
      case 3:
        return "gold";
      case 4:
        return "silver";
      case 5:
        return "bronze";
      default:
        return "";
    }
  }

  render() {
    const { agent_name, points, score, rank, extension } = this.props.data;
    return (
      <ListGroupItem
        className={`list-group-item-divider ${this.getColor(rank)}`}
      >
        <div className="d-flex flex-row">
          <div className="avatar mr-3" style={{ width: 50 }}>
            <div
              className="div-avatar"
              style={{
                backgroundImage: `url(${this.props.images[extension]}), url(${avatar})`,
              }}
            ></div>
          </div>
          <div className="flex-fill">
            {extension}: {agent_name}
            <div className="d-flex justify-content-between mb-1">
              <div className="small text-muted">Score {score}</div>
              <div className="small text-muted">{points.toFixed(1)} Points</div>
            </div>
            <Progress
              className="progress-xs"
              color={this.getColor(rank)}
              value={points}
            />
          </div>
        </div>
      </ListGroupItem>
    );
  }
}

function mapStateToProps({ images }) {
  return {
    images,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getImage,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
