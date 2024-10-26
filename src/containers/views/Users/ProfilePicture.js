import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { uploadImage, getImage } from "../../../actions/users";

import avatar from "../../../theme/avatar.jpg";

class ProfilePicture extends Component {
  componentWillMount() {
    this.props.getImage(this.props.extension);
  }

  onImageChange = (event) => {
    console.log(event.target.files);
    this.props.uploadImage({
      extension: this.props.extension,
      file: event.target.files[0],
    });

    console.log(event.target.files);
  };

  onSubmit = (e) => {
    e.preventDefault();
  };

  render() {
      console.log(this.props.images);
    return (
      <div
        style={{ backgroundImage: `url(${this.props.images[this.props.extension]}), url(${avatar})` }}
        className="change-profile-picture"
        onClick={(e) => this.refs.fileUploader.click()}
      >
        <div className="overlay">
          <i className="fa fa-plus align-middle"></i>
        </div>
        <input
          type="file"
          name="files"
          onChange={this.onImageChange}
          alt="image"
          ref="fileUploader"
          className="file"
        />
      </div>
    );
  }
}

function mapStateToProps({ images }) {
  return {
    images
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      uploadImage,
      getImage,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePicture);
