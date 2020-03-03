import React, { Component } from "react";
import firebase from "../firebase/firebase";
import Navbar from "./Navbar";
import MessageList from "./MessageList";
import "bulma/css/bulma.css";
import logo from '../logo.svg';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      message: "",
      messages: [],
      image: "",
      comment: "",
      currentUser: null
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          currentUser: user
        });
        firebase
          .firestore()
          .collection("users")
          .doc(user.email)
          .collection("messages")
          .onSnapshot(item => {
            this.setState({
              messages: item
            });
          });
        firebase.storage()
        .ref('conan.jpg')
        .getDownloadURL()
        .then(response => {
          this.setState({image: response})
        })
      }
    });
  }

  onChange = e => {
    const { name, value } = e.target;

    this.setState({
      [name]: value
    });
  };

  onSubmit = e => {
    e.preventDefault();
    const { email, password } = this.state;

    console.log(email, password);

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(response => {
        this.setState({
          currentUser: response.user
        });
      })
      .catch(error => {
        this.setState({
          message: error.message
        });
      });
  };

  logout = () => {
    firebase
      .auth()
      .signOut()
      .then(response => {
        this.setState({ currentUser: null });
      });
  };

  post = e => {
    firebase
      .firestore()
      .collection("users")
      .doc(this.state.currentUser.email)
      .collection("messages")
      .add({
        text: this.state.comment,
        timestamp: new Date()
      });
  };

  delete = e => {
    firebase
      .firestore()
      .collection("users")
      .doc(this.state.currentUser.email)
      .collection("messages")
      .doc(e.target.value)
      .delete();
  };

  render() {
    if (this.state.currentUser) {
      return (
        <div>
          <Navbar
            username={this.state.currentUser.email}
            logout={this.logout}
          />
          <MessageList
            image={this.state.image}
            messages={this.state.messages}
            onChange={this.onChange}
            post={this.post}
            delete={this.delete}
          />
        </div>
      );
    } else {
      return (
        <section className="section container">
          <div className="columns is-centered">
            <div className="column is-half">
              <form onSubmit={this.onSubmit}>
                <div className="field">
                  <label className="label">Email</label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      name="email"
                      onChange={this.onChange}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Password</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      name="password"
                      onChange={this.onChange}
                    />
                  </div>
                  {this.state.message ? (
                    <p className="help is-danger">{this.state.message}</p>
                  ) : null}
                </div>
                <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-link">Login</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      );
    }
  }
}

export default Login;
