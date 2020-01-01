import merge from 'lodash.merge';
import AsyncStorage from '@react-native-community/async-storage';
import User from '../model/AuthResponse';

class Storage {
  saveRefreshToken(token: string) {
    this.save('pg.refresh.token', token);
  }

  saveAccessToken(token: string) {
    this.save('pg.access.token', token);
  }

  saveUser(user: User) {
    this.save('pg.user', user);
  }

  async getRefreshToken() {
    return await this.get('pg.refresh.token');
  }

  async getAccessToken() {
    return await this.get('pg.access.token');
  }

  async getUser() {
    return await this.get('pg.user');
  }

  /**
   * Get a one or more value for a key or array of keys from AsyncStorage
   * @param {String|Array} key A key or array of keys
   * @return {Promise}
   */
  private async get(key) {
    if (!Array.isArray(key)) {
      const value = await AsyncStorage.getItem(key);
      console.log(value);
      return JSON.parse(value);
    } else {
      const values = await AsyncStorage.multiGet(key);
      return values.map(value => {
        return JSON.parse(value[1]);
      });
    }
  }

  /**
   * Save a key value pair or a series of key value pairs to AsyncStorage.
   * @param  {String|Array} key The key or an array of key/value pairs
   * @param  {Any} value The value to save
   * @return {Promise}
   */
  private save(key, value) {
    if (!Array.isArray(key)) {
      return AsyncStorage.setItem(key, JSON.stringify(value));
    } else {
      var pairs = key.map(function(pair) {
        return [pair[0], JSON.stringify(pair[1])];
      });
      return AsyncStorage.multiSet(pairs);
    }
  }

  /**
   * Updates the value in the store for a given key in AsyncStorage. If the value is a string it will be replaced. If the value is an object it will be deep merged.
   * @param  {String} key The key
   * @param  {Value} value The value to update with
   * @return {Promise}
   */
  private update(key, value) {
    return this.get(key).then(item => {
      value = typeof value === 'string' ? value : merge({}, item, value);
      return AsyncStorage.setItem(key, JSON.stringify(value));
    });
  }

  /**
   * Delete the value for a given key in AsyncStorage.
   * @param  {String|Array} key The key or an array of keys to be deleted
   * @return {Promise}
   */
  private delete(key) {
    if (Array.isArray(key)) {
      return AsyncStorage.multiRemove(key);
    } else {
      return AsyncStorage.removeItem(key);
    }
  }

  /**
   * Get all keys in AsyncStorage.
   * @return {Promise} A promise which when it resolves gets passed the saved keys in AsyncStorage.
   */
  private keys() {
    return AsyncStorage.getAllKeys();
  }

  /**
   * Push a value onto an array stored in AsyncStorage by key or create a new array in AsyncStorage for a key if it's not yet defined.
   * @param {String} key They key
   * @param {Any} value The value to push onto the array
   * @return {Promise}
   */
  private push(key, value) {
    return this.get(key).then(currentValue => {
      if (currentValue === null) {
        // if there is no current value populate it with the new value
        return this.save(key, [value]);
      }
      if (Array.isArray(currentValue)) {
        return this.save(key, [...currentValue, value]);
      }
      throw new Error(
        `Existing value for key "${key}" must be of type null or Array, received ${typeof currentValue}.`,
      );
    });
  }
}

export default new Storage();
