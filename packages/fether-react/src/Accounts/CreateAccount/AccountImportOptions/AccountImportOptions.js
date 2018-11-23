import React, { Component } from 'react';
import { Card, Form as FetherForm } from 'fether-ui';

import { inject, observer } from 'mobx-react';

@inject('createAccountStore')
@observer
class AccountImportOptions extends Component {
  state = {
    isLoading: false,
    isFileValid: false,
    json: null,
    value: ''
  };

  handleNextStep = async () => {
    const {
      history,
      location: { pathname },
      createAccountStore: { isImport, isJSON, setJSON, setPhrase }
    } = this.props;
    const currentStep = pathname.slice(-1);
    const { json, value } = this.state;

    if (isJSON) {
      this.setState({ isLoading: true });
      await setJSON(json);
    }

    if (isImport && !isJSON) {
      this.setState({ isLoading: true });
      await setPhrase(value);
    }

    history.push(`/accounts/new/${+currentStep + 1}`);
  };

  handleChange = ({ target: { value } }) => {
    this.setState({ value });
  };

  handleChangeFile = ({ target: { result } }) => {
    const {
      createAccountStore: { setIsJSON }
    } = this.props;

    try {
      const json = JSON.parse(result);

      setIsJSON(true);

      const isFileValid =
        json.address.length === 40 &&
        json.meta &&
        json.crypto &&
        json.crypto.cipher === 'aes-128-ctr';

      const prefix = '0x';

      json.address = prefix.concat(json.address);

      if (isFileValid) {
        this.setState({
          json: json
        });

        this.handleNextStep();
      }
    } catch (error) {
      console.error(error);
    }
  };

  render () {
    const {
      history,
      location: { pathname }
    } = this.props;
    const { value } = this.state;
    const currentStep = pathname.slice(-1);

    const jsonCard = [
      <div key='createAccount'>
        <div className='text -centered'>
          <p> Recover from JSON Keyfile </p>

          <FetherForm.InputFile
            label='JSON Backup Keyfile'
            onChangeFile={this.handleChangeFile}
            required
          />
        </div>
      </div>
    ];

    const phraseCard = [
      <div key='importBackup'>
        <div className='text -centered'>
          <p>Recover from Seed Phrase</p>
        </div>

        <FetherForm.Field
          as='textarea'
          label='Recovery phrase'
          onChange={this.handleChange}
          required
          value={value}
        />
      </div>
    ];

    return (
      <div className='center-md'>
        <Card> {jsonCard} </Card>
        <br />
        <Card> {phraseCard} </Card>
        <br />
        {this.renderButton()}
        <nav className='form-nav -space-around'>
          {currentStep > 1 && (
            <button className='button -cancel' onClick={history.goBack}>
              Back
            </button>
          )}
        </nav>
      </div>
    );
  }

  renderButton = () => {
    const { isFileValid, isLoading, json, value } = this.state;
    // If we are importing an existing account, the button goes to the next step
    return (
      <button
        className='button'
        disabled={
          (!json && !value.length) || (json && !isFileValid) || isLoading
        }
        onClick={this.handleNextStep}
      >
        Next
      </button>
    );
  };
}

export default AccountImportOptions;