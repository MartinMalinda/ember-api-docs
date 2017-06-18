import Ember from 'ember';
import _ from 'lodash';

const { computed, Component } = Ember;

const filterItems = function(itemType) {
  return computed(`model.${itemType}.[]`, 'filterData.{showInherited,showProtected,showPrivate,showDeprecated}',
    function() {
      let items = this.get('model.' + itemType);
      if (!this.get('filterData.showInherited')) {
        items = items.filter(item => item.inherited !== true);
      }
      if (!this.get('filterData.showProtected')) {
        items = items.filter(item => item.access !== 'protected');
      }
      if (!this.get('filterData.showPrivate')) {
        items = items.filter(item => item.access !== 'private');
      }
      if (!this.get('filterData.showDeprecated')) {
        items = items.filter(item => item.deprecated !== true);
      }
      return _.uniq(_.sortBy(items, 'name'), true, (item => item.name));
    }
  );
}

export default Component.extend({
  classNames: ['api-index-filter'],

  filteredMethods: filterItems('methods'),
  filteredEvents: filterItems('events'),
  filteredProperties: filterItems('properties'),

  filteredData: computed('filteredMethods', 'filteredProperties', 'filteredEvents', function() {
    return {
      methods: this.get('filteredMethods'),
      properties: this.get('filteredProperties'),
      events: this.get('filteredEvents')
    };
  })

});
