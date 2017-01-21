import $ from 'jquery'

export default class Buttons
{
  constructor() {
      this.$template = $(`
          <span class="on_off_button">
              <a class="link"></a>
          </span>
      `);
      this.$balloon = this.$template.find('.link');
  }

  _make() {
    // Must to be Override.
  }

  getClassName() {
      // Must to be Override.
  }

  getDom() {
      // Must to be Override.
  }

  toggleOn() {
    // Must to be Override.
  }

  toggleOff() {
    // Must to be Override.
  }

  isToggledOn() {
    // Must to be Override.
  }

  saveAsAutoEnter() {
    // Must to be Override.
  }

  removeAsAutoEnter() {
    // Must to be Override.
  }
}
