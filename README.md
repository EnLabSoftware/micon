# MICON #

MICON is a platform for Machine Intelligence Contests

## Project Specifications ##

There are a few major sections to the site:

* Main page - will feature each weekends competition
* Competition page - Page hosting all of the details of the currently active competition
* Competition gallery - Page listing/linking to previously complete competitions
* MICON admin panel - An admin panel that facilitates the creation of a new contest (in a sense MICON is a CMS for machine intelligence contests)

### Main page ###

* Suggested template: http://blackrockdigital.github.io/startbootstrap-creative/ (source available at: https://startbootstrap.com/template-overviews/creative/)

### Competition page ###

* To do

### Competition gallery ###

* To do

### MICON admin panel ###

* Each competition will be created in the admin panel (which will store competition related info into a database), fields required for each competition include:
    * **competition_title_short**
    * **competition_title_full**
    * **competition_start_time**
    * **competition_end_time**
    * **competition_logo** - a small image related to the competition
    * **competition_image** - a large image related to the competition (for the main page and competition page)
    * **competition_description_short**
    * **competition_description_full**
    * **competition_training_data** (browse/upload field)
    * **competition_testing_data** (browse/upload field) - site security must be tight so no one can access this

------

* After a competition is created, we should be able to see a list of all created competitions in the admin panel. Then we can select a competition and hit a button called "Activate" to make that competition the active competition. When we do that, **competition_image** will go to the front page, and **competition_description_short** will also go to the front page. A new competition url will be created /url/**competition_title_short** (this url will link to a page with the **Competition page** format)

* When a competition finishes (based on **competition_end_time**), it and all associated information will get archived and added to the **Competition gallery**