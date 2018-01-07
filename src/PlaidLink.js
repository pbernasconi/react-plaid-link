import React, { Component } from "react";
import Script from "react-load-script";
import PropTypes from "prop-types";

class PlaidLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabledButton: true,
      linkLoaded: false,
      initializeURL: "https://cdn.plaid.com/link/v2/stable/link-initialize.js"
    };
  }

  static defaultProps = {
    institution: null,
    selectAccount: false,
    buttonText: "Open Link",
    style: {
      padding: "6px 4px",
      outline: "none",
      background: "#FFFFFF",
      border: "2px solid #F1F1F1",
      borderRadius: "4px"
    }
  };

  static propTypes = {
    // Displayed once a user has successfully linked their account
    clientName: PropTypes.string.isRequired,

    // The Plaid API environment on which to create user accounts.
    // For development and testing, use tartan. For production, use production
    env: PropTypes.oneOf(["tartan", "sandbox", "development", "production"])
      .isRequired,

    // Open link to a specific institution, for a more custom solution
    institution: PropTypes.string,

    // The public_key associated with your account; available from
    // the Plaid dashboard (https://dashboard.plaid.com)
    publicKey: PropTypes.string.isRequired,

    // The Plaid products you wish to use, an array containing some of connect,
    // auth, identity, income, transactions
    product: PropTypes.arrayOf(
      PropTypes.oneOf(["auth", "identity", "transactions"])
    ).isRequired,

    // Specify an existing user's public token to launch Link in update mode.
    // This will cause Link to open directly to the authentication step for
    // that user's institution.
    token: PropTypes.string,

    // Set to true to launch Link with the 'Select Account' pane enabled.
    // Allows users to select an individual account once they've authenticated
    selectAccount: PropTypes.bool,

    // Specify a webhook to associate with a user.
    webhook: PropTypes.string,

    // A function that is called when a user has successfully onboarded their
    // account. The function should expect two arguments, the public_key and a
    // metadata object
    onSuccess: PropTypes.func.isRequired,

    // A function that is called when a user has specifically exited Link flow
    onExit: PropTypes.func,

    // A function that is called when the Link module has finished loading.
    // Calls to plaidLinkHandler.open() prior to the onLoad callback will be
    // delayed until the module is fully loaded.
    onLoad: PropTypes.func,

    // Text to display in the button
    buttonText: PropTypes.string,

    // Button Styles as an Object
    style: PropTypes.object,

    // Button Class names as a String
    className: PropTypes.string,

    // ApiVersion flag to use new version of Plaid API
    apiVersion: PropTypes.string
  };

  onScriptError = () => {
    console.error("There was an issue loading the link-initialize.js script");
  };

  onScriptLoaded = () => {
    window.linkHandler = window.Plaid.create({
      clientName: this.props.clientName,
      env: this.props.env,
      key: this.props.publicKey,
      apiVersion: this.props.apiVersion,
      onExit: this.props.onExit,
      onLoad: this.handleLinkOnLoad,
      onSuccess: this.props.onSuccess,
      product: this.props.product,
      selectAccount: this.props.selectAccount,
      token: this.props.token,
      webhook: this.props.webhook
    });

    this.setState({ disabledButton: false });
  };

  handleLinkOnLoad = () => {
    this.props.onLoad && this.props.onLoad();
    this.setState({ linkLoaded: true });
  };

  handleOnClick = () => {
    this.props.onClick && this.props.onClick();
    var institution = this.props.institution || null;
    if (window.linkHandler) {
      window.linkHandler.open(institution);
    }
  };

  exit = configurationObject => {
    if (window.linkHandler) {
      window.linkHandler.exit(configurationObject);
    }
  };

  render() {
    return (
      <div>
        <button
          onClick={this.handleOnClick}
          disabled={this.state.disabledButton}
          style={this.props.style}
          className={this.props.className}
        >
          <span>{this.props.buttonText}</span>
        </button>
        <Script
          url={this.state.initializeURL}
          onError={this.onScriptError}
          onLoad={this.onScriptLoaded}
        />
      </div>
    );
  }
}

export default PlaidLink;
